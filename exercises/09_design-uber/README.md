# Design The Uber API

*Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.\
It's your job to ask clarifying questions to better understand the system that you have to build.*

*We've laid out some of these questions below; their answers should give you some guidance on the problem.\
Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.*

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:**

*Uber has a lot of different services: there’s the core ride-hailing Uber service, there’s UberEats, there’s UberPool — are we designing the API for all of these services, or just for one of them?*

**A:**
Let’s just design the core rides API — not UberEats or UberPool.

### Question 2

**Q:**\
*At first thought, it seems like we're going to need both a passenger-facing API and a driver-facing API — does that make sense, and if yes, should we design both?*

**A:**\
Yes, that totally makes sense.\
And yes, let’s design both, starting with the passenger-facing API.

### Question 3

**Q:**

To make sure we’re on the same page, this is the functionality that I'm envisioning this API will support:

- A user (a passenger) goes on their phone and hails a ride.\
    They get matched with a driver.\
    Then they can track their ride as it’s in progress, until they reach their destination, at which point the ride is complete.
- Throughout this process, there are a few more features to support, like being able to track where the passenger's driver is before the passenger gets picked up, maybe being able to cancel rides, etc..
- Does this capture most of what you had in mind?

**A:**\
Yes, this is precisely what I had in mind.\
And you can work out the details as you start designing the API.

### Question 4

**Q:**

- *Do we need to handle things like creating an Uber account, setting up payment preferences, contacting Uber, etc..?*
- *What about things like rating a driver, tipping a driver, etc.?*

**A:**\
For now, let’s skip those and really focus on the core taxiing service.

### Question 5

**Q:**\
Just to confirm, you want me to write out function signatures for various API endpoints, including parameters, their types, return values, etc., right?

**A:** Yup, exactly.

## Solution Walkthrough

### 1. Gathering Requirements

As with any API design interview question, the first thing that we want to do is to gather API requirements; we need to figure out what API we're building exactly.

We're focusing on the core ride-hailing service that Uber offers.\
Passengers can book a ride from their phone, get matched with a driver, and track the driver's location until the ride is finished or cancelled.\
They can also see the ride's price and the estimated time to their destination throughout the trip, among other details.

The Uber core service has both a *passenger-facing* side and a *driver-facing* side.\
We will design the API for both sides.

### 2. Coming Up With A Plan

It's important to organize ourselves and to lay out a clear plan regarding how we're going to tackle our design.\
What are the major, potentially contentious parts of our API?\
Why are we making certain design decisions?

We'll centre our API around a [*Ride*](#ride) entity.\
Every Uber ride will have an associated *Ride* containing information about the ride, including details about the passenger and the driver.

Because a typical Uber ride can only have one passenger (one passenger account hailing the ride) and one driver.\
So we'll handle all permissions related to ride operations through passenger and driver IDs.\
So to speak, operations like *GetRide* and *EditRide* will rely on a passed `userId`, the `userId` of the passenger or driver, to return the appropriate ride tied to that user.

We'll start by defining the *Ride* entity before designing the *passenger-facing* API and then the *driver-facing* API.

### 3. Entities

#### Ride

The *Ride* entity will have a unique id, information about its passenger and driver, a status, and other ride details.

- `id`: *string*
- `passengerInfo`: *PassengerInfo*
- `driverInfo`?: *DriverInfo*
- `status`: *RideStatus* – enum `CREATED`/`MATCHED`/`STARTED`/`FINISHED`/`CANCELED`
- `start`: *GeoLocation*
- `destination`: *GeoLocation*
- `createdAt`: *timestamp*
- `startTime`: *timestamp*
- `estimatedPrice`: *int*
- `timeToDestination`: *int*

We'll explain why the *driverInfo* is optional when we get to the API endpoints.

#### PassengerInfo

- `id`: *string*
- `name`: *string*
- `rating`: *int*

#### DriverInfo

- `id`: *string*
- `name`: *string*
- `status`: *DriverStatus* – enum `UNAVAILABLE`/`IN_RIDE`/`STANDBY`
- `rating`: *int*
- `ridesCount`: *int*
- `vehicleInfo`: *VehicleInfo*

#### VehicleInfo

- `licensePlate`: *string*
- `description`: *string*

### 4. Passenger API

The passenger-facing API will consist of simple CRUD operations around the [*Ride*](#ride) entity and an endpoint to stream a driver's location throughout a ride.

#### CreateRide

```python
CreateRide(userId: string, pickup: GeoLocation, destination: GeoLocation)
  => Ride
```

**Usage:**\
*CreateRide* is called when a passenger books a ride.\
A [*Ride*](#ride) is created with no [*DriverInfo*](#driverinfo) (that's why `driverInfo` in the Ride entity is `null`) and with a *`RideStatus.CREATED`*.\
The Uber backend calls an internal [*FindDriver*](#finddriver) API that uses an algorithm to find the most appropriate driver.\
When a driver is found and accepts the ride, the backend calls [*EditRide*](#passenger-api__edit-ride) with the driver's info and a *`RideStatus.MATCHED`*.

> Note:\
> $CreateRide\to FindDriver\to EditRide$ by Uber’s internal API

<h4 id="passenger-api__get-ride">GetRide</h4> <!-- markdownlint-disable-line MD033 -->

```python
GetRide(userId: string)
  => Ride
```

**Usage:**\
*GetRide* is polled every couple of seconds after creating a ride until the ride has a status of *`RideStatus.MATCHED`*.\
Afterwards, it is polled every 20-90 seconds throughout the trip to update the ride's estimated price, time to destination, *RideStatus* if the driver cancels, etc.

<h4 id="passenger-api__edit-ride">EditRide</h4> <!-- markdownlint-disable-line MD033 -->

```python
EditRide(userId: string, [...params?: all properties on the Ride object that need to be edited])
  => Ride
```

<h4 id="passenger-api__cancel-ride">CancelRide</h4> <!-- markdownlint-disable-line MD033 -->

```python
CancelRide(userId: string)
  => void
```

Wrapper around [*EditRide*](#passenger-api__edit-ride) — effectively calls *`EditRide(userId: string, rideStatus: RideStatus.CANCELLED)`*.

#### StreamDriverLocation

```python
StreamDriverLocation(userId: string)
  => GeoLocation
```

**Usage:**\
*StreamDriverLocation* continuously streams the location of a driver over a long-lived WebSocket connection.\
The driver whose streams the location is the one associated with the [*Ride*](#ride) tied to the passed *userId*.

### 5. Driver API

The driver-facing API will use some of the same CRUD operations around the [*Ride*](#ride) entity.\
It will also have a *SetDriverStatus* endpoint and an endpoint to push the driver's location to passengers who are streaming it.

#### SetDriverStatus

```python
SetDriverStatus(userId: string, driverStatus: DriverStatus)
  => void

DriverStatus: enum UNAVAILABLE/IN_RIDE/STANDBY
```

**Usage:**\
*SetDriverStatus* is called when a driver wants to look for a ride, is starting a ride (*`DriverStatus.STANDBY`*), or is stopped for the day (*`DriverStatus.UNAVAILABLE`*).\
After we invoke *SetDriverStatus* with *`DriverStatus.STANDBY`*, the Uber backend calls an internal *FindRide* API that uses an algorithm to enqueue the driver in a queue of drivers waiting for rides and to find the most appropriate ride.\
Once a ride is found, it is internally locked to the driver for 30 seconds, during which the driver can **accept** or **reject** the ride.\
Once the driver **accepts** the ride, the internal backend calls [*EditRide*](#driver-api__edit-ride) with the driver's info and a *`RideStatus.MATCHED`*.

<h4 id="driver-api__get-ride">GetRide</h4> <!-- markdownlint-disable-line MD033 -->

```python
GetRide(userId: string)
  => Ride
```

**Usage:**\
*GetRide* is polled every 20-90 seconds throughout the trip to update the ride's estimated price, time to destination, whether it's been cancelled, etc.

**Usage:**\
*GetRide* is polled every 20-90 seconds throughout the trip to update the ride's estimated price, its time to destination, whether it's been canceled, etc..

<h4 id="driver-api__edit-ride">EditRide</h4> <!-- markdownlint-disable-line MD033 -->

```python
EditRide(userId: string, [...params?: all properties on the Ride object that need to be edited])
  => Ride
```

#### AcceptRide

```python
AcceptRide(userId: string)
  => void
```

*AcceptRide* calls *`EditRide(userId, RideStatus.MATCHED)`* and *`SetDriverStatus(userId, DriverStatus.IN_RIDE)`*.

<h4 id="driver-api__cancel-ride">CancelRide</h4> <!-- markdownlint-disable-line MD033 -->

```python
CancelRide(userId: string)
  => void
```

Wrapper around [*EditRide*](#driver-api__edit-ride) — effectively calls *`EditRide(userId, RideStatus.CANCELLED)`*.
And also *`SetDriverStatus(userId, DriverStatus.STANDBY)`*.

> Note:
> $CancelRide\to EditRide$ by Uber’s internally API

#### PushLocation

```python
PushLocation(userId: string, location: GeoLocation)
  => void
```

**Usage:**\
*PushLocation* is continuously called by a driver's phone throughout a ride.\
It pushes the driver's location to the relevant passenger who's streaming the location.\
The passenger is the one associated with the *Ride* tied to the passed *`userId`*.

### 6. UberPool

As a stretch goal, we will consider how to expand the design to handle UberPool rides.

UberPool rides allow multiple passengers (different Uber accounts) to share an Uber ride for a cheaper price.

One approach is to allow *Ride* objects to have multiple *passengerInfo*s.\
In this case, *Ride*s would also have to maintain a list of all destinations the ride will stop at and the relevant final destinations for individual passengers.

Another approach is to introduce a new entity.\
It's called a *PoolRide*, with the list of *Ride*s attached.\
Passengers would still call the *CreateRide* endpoint when booking an UberPool ride.\
That means they still have their own, normal *Ride* entity.\
However, this entity would be attached to a *PoolRide* entity with the rest of the UberPool ride information.

Drivers might have an extra *DriverStatus* value to indicate if they are in a ride but still accepting new UberPool passengers.

Most of the other functionality would remain the same.\
Passengers and drivers would still poll the *GetRide* endpoint for updated ride information.\
Passengers would still stream their driver's location.\
And they can still cancel their rides.

#### Entities

**PoolRide:**

- `driverInfo`: *DriverInfo* — (It is redundant with the `Ride.driverInfo`, but it is okay)
- `rides`: *List\[Ride\]*

### 7. Uber Backend API (Optional)

Here is my more note.

Run in the background as asynchronous algorithm.

#### FindDriver

```python
FindDriver(rideId: string)
  => Driver
```

#### FindRide

```python
FindRide()
  => Ride | null
```

Return `null` when the driver is not matched by any ride.
