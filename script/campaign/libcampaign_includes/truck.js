
////////////////////////////////////////////////////////////////////////////////
// Truck management.
////////////////////////////////////////////////////////////////////////////////

//;; ## camManageTrucks(playerId [, allowOilCapture])
//;;
//;; Manage trucks for an AI player. This assumes rebuilding destroyed trucks
//;; in factories, which is implemented via the `camQueueDroidProduction()` mechanism.
//;;
//;; @param {number} playerId
//;; @param {boolean} allowOilCapture
//;; @returns {void}
//;;
function camManageTrucks(playerId, allowOilCapture)
{
	if (!camDef(allowOilCapture))
	{
		allowOilCapture = true;
	}
	__camTruckInfo[playerId] = { enabled: 1, queue: [], player: playerId, grabOil: allowOilCapture };
}

//;; ## camQueueBuilding(playerId, stat[, position])
//;;
//;; Assuming truck management is enabled for the player, issue an order to build a specific building
//;; near a certain position. The order would be issued once as soon as a free truck becomes available.
//;; It will not be re-issued in case the truck is destroyed before the building is finished.
//;; If position is unspecified, the building would be built near the first available truck.
//;; Otherwise, position may be a label or a `POSITION`-like object.
//;;
//;; @param {number} playerId
//;; @param {string} stat
//;; @param {string|Object} [position]
//;; @returns {void}
//;;
function camQueueBuilding(playerId, stat, position)
{
	const ti = __camTruckInfo[playerId];
	ti.queue.push({ stat: stat, pos: camMakePos(position) });
}

//////////// privates

function __camEnumFreeTrucks(player)
{
	const rawDroids = enumDroid(player, DROID_CONSTRUCT);
	const droids = [];
	for (let i = 0, l = rawDroids.length; i < l; ++i)
	{
		const droid = rawDroids[i];
		if (droid.order !== DORDER_BUILD && droid.order !== DORDER_HELPBUILD && droid.order !== DORDER_LINEBUILD)
		{
			droids.push(droid);
		}
	}
	return droids;
}

function __camGetClosestTruck(player, pos, list)
{
	const droids = (camDef(list) && list !== null) ? list : __camEnumFreeTrucks(player);
	if (droids.length <= 0)
	{
		return undefined;
	}
	// Find out which one is the closest.
	let minDroid = droids[0];
	let minDist = camDist(minDroid, pos);
	for (let i = 1, l = droids.length; i < l; ++i)
	{
		const droid = droids[i];
		if (!droidCanReach(droid, pos.x, pos.y))
		{
			continue;
		}
		const __DIST = camDist(droid, pos);
		if (__DIST < minDist)
		{
			minDist = __DIST;
			minDroid = droid;
		}
	}
	return minDroid;
}

function __camTruckTick()
{
	// Issue truck orders for each player.
	// See comments inside the loop to understand priority.
	for (const playerObj in __camTruckInfo)
	{
		const ti = __camTruckInfo[playerObj];
		const __PLAYER = ti.player;
		const __CAPTURE_OIL = ti.grabOil;
		let freeTrucks = __camEnumFreeTrucks(__PLAYER);
		let truck;
		// First, build things that were explicitly ordered.
		while (ti.queue.length > 0)
		{
			const __QI = ti.queue[0];
			let pos = __QI.pos;
			let randx = 0;
			let randy = 0;
			if (camDef(pos))
			{
				// Find the truck most suitable for the job.
				truck = __camGetClosestTruck(__PLAYER, pos, freeTrucks);
				if (!camDef(truck))
				{
					break;
				}
			}
			else
			{
				// Build near any truck if pos was not specified.
				if (freeTrucks.length <= 0)
				{
					break;
				}
				truck = freeTrucks[0];
				pos = truck;
				randx = (camRand(100) < 50) ? -camRand(2) : camRand(2);
				randy = (camRand(100) < 50) ? -camRand(2) : camRand(2);
			}
			enableStructure(__QI.stat, __PLAYER);
			const loc = pickStructLocation(truck, __QI.stat, pos.x, pos.y);
			if (camDef(loc) && camDef(truck))
			{
				if (orderDroidBuild(truck, DORDER_BUILD, __QI.stat, loc.x + randx, loc.y + randy))
				{
					freeTrucks = freeTrucks.filter((tr) => (tr.id !== truck.id));
					ti.queue.shift(); // consider it handled
				}
			}
		}
		// Then, capture free oils.
		if (__CAPTURE_OIL)
		{
			const oils = enumFeature(ALL_PLAYERS, CAM_OIL_RESOURCE_STAT);
			if (oils.length === 0)
			{
				continue;
			}
			const oil = oils[0];
			truck = __camGetClosestTruck(__PLAYER, oil, freeTrucks);
			if (camDef(truck))
			{
				enableStructure(cam_base_structures.derrick, __PLAYER);
				orderDroidBuild(truck, DORDER_BUILD, cam_base_structures.derrick, oil.x, oil.y);
			}
		}
	}
}

// called from eventDestroyed
function __camCheckDeadTruck(obj)
{
	if (camDef(__camTruckInfo[obj.player]))
	{
		// multi-turret templates are not supported yet
		// cyborg engineers are not supported yet
		// cannot use obj.weapons[] because spade is not a weapon
		camQueueDroidProduction(obj.player, {
			body: obj.body,
			prop: obj.propulsion,
			weap: CAM_GENERIC_TRUCK_STAT
		});
	}
}
