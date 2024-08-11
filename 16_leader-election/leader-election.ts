import os from 'os'
import { Election, Etcd3 } from 'etcd3';

const client = new Etcd3();
const election = new Election(client, 'leader-election');


function runCampaign(serverName: string): void {
  const campaign = election.campaign(serverName);
  campaign.on('elected', () => {
    console.log('I am the leader!');
  });
  campaign.on('error', (error) => {
    console.error(error)
    console.log("Worker is not the leader");
    setTimeout(runCampaign, 5000);
  });
}

async function observeLeader(): Promise<void> {
  const observer = await election.observe();
  console.log("The current leader is", observer.leader());

  observer.on('change', (leader) => {
    console.log("The new leader is", leader);
  });

  observer.on('error', () => {
    console.error("Error observing leader");
    setTimeout(observeLeader, 5000);
  });
}

async function main(): Promise<void> {
  const serverName = process.env.SERVER_NAME || os.hostname();
  console.log("Server name is", serverName);
  runCampaign(serverName);
  await observeLeader();
}

main().catch(console.error);
