//query 1.1
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh";
const regionsCollectionName = "Regions";
const tripsCollectionName = "Trips";

async function findTripsIntersectingPolygon(regionId) {
const client = new MongoClient(uri);

try {
 await client.connect();
 console.log("Connected to MongoDB");
  
const db = client.db(dbName);
const regionsCollection = db.collection(regionsCollectionName);
const tripsCollection = db.collection(tripsCollectionName);

  // Βρίσκουμε το Polygon με το συγκεκριμένο RegionID
console.time("Query Execution Time");
const region = await regionsCollection.findOne({ RegionID: String(regionId) });

if (!region) {
 console.log(`No region found with RegionID ${regionId}`);
 return;
 }

console.log(`Region found with RegionID ${regionId}:`, JSON.stringify(region, null, 2));

 // Query για να βρούμε τα trips που αλληλεπιδρούν με το Polygon
const query = {
 "Trip.coordinates": {
 $geoIntersects: {
 $geometry: region.geometry
  }
 }
};

const trips = await tripsCollection.find(query).toArray();
console.timeEnd("Query Execution Time"); 

if (trips.length > 0) {
console.log(`${trips.length} trips intersect with the polygon:`);

 // Ταξινόμηση των trips με βάση το MMSI
trips.sort((a, b) => a.MMSI - b.MMSI);

// Εμφανίζουμε τα αποτελέσματα με RegionID και MMSI
trips.forEach((trip) => {
console.log(`RegionID: ${regionId}, MMSI: ${trip.MMSI}`);
});
 } else {
 console.log("No trips intersect with the polygon.");
 }

} catch (err) {
console.error("An error occurred while finding trips:", err);
} finally {
 await client.close();
 console.log("MongoDB connection closed");
 }
}


async function main() {
await findTripsIntersectingPolygon(1);
}

main().catch(console.error);


//query 1.2
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh";
const regionsCollectionName = "Regions";
const tripsCollectionName = "Trips";

// Βήμα 2: Αναζήτηση Trips που αλληλεπιδρούν με το Polygon
async function findTripsIntersectingPolygon(regionId) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const regionsCollection = db.collection(regionsCollectionName);
    const tripsCollection = db.collection(tripsCollectionName);

    // Βρίσκουμε το Polygon με το συγκεκριμένο RegionID
    console.time("Query Execution Time");
    const region = await regionsCollection.findOne({ RegionID: String(regionId) });  
    if (!region) {
      console.log(`No region found with RegionID ${regionId}`);
      console.timeEnd("Query Execution Time");
      return;
    }
    console.log(`Region found with RegionID ${regionId}:`, JSON.stringify(region, null, 2));

    // Query για να βρούμε τα trips που αλληλεπιδρούν με το Polygon
    const query = {
      "Trip.coordinates": {
        $geoIntersects: {
          $geometry: region.geometry
        }
      }
    };

    const trips = await tripsCollection.find(query).toArray();
    console.timeEnd("Query Execution Time");

    if (trips.length > 0) {
      console.log(`${trips.length} trips intersect with the polygon:`);

      // Ταξινόμηση των trips με βάση το MMSI
      trips.sort((a, b) => a.MMSI - b.MMSI);

      // Εμφανίζουμε τα αποτελέσματα με RegionID και MMSI
      trips.forEach((trip) => {
        console.log(`RegionID: ${regionId}, MMSI: ${trip.MMSI}`);
      });
    } else {
      console.log("No trips intersect with the polygon.");
    }

  } catch (err) {
    console.error("An error occurred while finding trips:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Εκτέλεση
async function main() {
  await findTripsIntersectingPolygon(2);
}

main().catch(console.error);




//query 2.1
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh";
const regionsCollectionName = "Regions";
const periodsCollectionName = "Periods";
const aisCollectionName = "AISInputFiltered";

async function findUniqueVesselsByRegionAndPeriod() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const regionsCollection = db.collection(regionsCollectionName);
    const periodsCollection = db.collection(periodsCollectionName);
    const aisCollection = db.collection(aisCollectionName);

    // Φέρνουμε όλα τα Regions
    console.time("Query Execution Time");
    const regions = await regionsCollection.find({}).toArray();
    if (!regions.length) {
      console.log("No regions found.");
      console.timeEnd("Query Execution Time");
      return;
    }

    // Φέρνουμε όλες τις χρονικές περιόδους
    const periods = await periodsCollection.find({}).toArray();
    if (!periods.length) {
      console.log("No periods found.");
      console.timeEnd("Query Execution Time");
      return;
    }

    const uniqueMMSIs = new Set(); // Για αποθήκευση μοναδικών MMSI
    const results = [];

    // Ελέγχουμε κάθε region
    for (const region of regions) {
      const regionId = region.RegionID;

      console.log(`Checking RegionID: ${regionId}`);

      // Ελέγχουμε κάθε χρονική περίοδο
      for (const period of periods) {
        const periodId = period.PeriodId;
        const tStart = new Date(period.Tstart);
        const tEnd = new Date(period.Tend);

        console.log(`Checking PeriodID: ${periodId}, Tstart: ${tStart}, Tend: ${tEnd}`);

        // Query για να βρούμε τα πλοία που τέμνονται με το πολύγωνο και βρίσκονται στη χρονική περίοδο
        const query = {
          geom: {
            $geoIntersects: {
              $geometry: region.geometry,
            },
          },
          timestamp: { $gte: tStart, $lte: tEnd },
        };

        const vessels = await aisCollection.find(query).toArray();

        // προσθήκη μοναδικών MMSI στα αποτελέσματα
        vessels.forEach((vessel) => {
          if (!uniqueMMSIs.has(vessel.ship_id)) {
            uniqueMMSIs.add(vessel.ship_id);
            results.push({
              RegionID: regionId,
              PeriodID: periodId,
              MMSI: vessel.ship_id,
            });
          }
        });
      }
    }

    // Ταξινόμηση αποτελεσμάτων
    results.sort((a, b) => {
      if (a.RegionID !== b.RegionID) return a.RegionID.localeCompare(b.RegionID); 
      if (a.PeriodID !== b.PeriodID) return a.PeriodID - b.PeriodID;
      return a.MMSI - b.MMSI;
    });

    console.timeEnd("Query Execution Time");
    console.log("Final Query Results (Sorted):", results);
  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Εκτέλεση
findUniqueVesselsByRegionAndPeriod().catch(console.error);



//query 2.2
const { MongoClient } = require("mongodb");
const fs = require("fs"); // Εισαγωγή του fs module για να γράψει σε αρχείο

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh";
const regionsCollectionName = "Regions";
const periodsCollectionName = "Periods";
const tripsCollectionName = "Trips";

async function findTripsByRegionAndPeriod() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const regionsCollection = db.collection(regionsCollectionName);
    const periodsCollection = db.collection(periodsCollectionName);
    const tripsCollection = db.collection(tripsCollectionName);

    console.time("Query Execution Time");

    const regions = await regionsCollection.find({}).toArray();
    if (!regions.length) {
      console.log("No regions found.");
      console.timeEnd("Query Execution Time");
      return;
    }

    const periods = await periodsCollection.find({}).toArray();
    if (!periods.length) {
      console.log("No periods found.");
      console.timeEnd("Query Execution Time");
      return;
    }

    const results = [];

    for (const region of regions) {
      const regionId = region.RegionID;

      console.log(`Checking RegionID: ${regionId}`);

      for (const period of periods) {
        const periodId = period.PeriodId;
        const tStart = new Date(period.Tstart);
        const tEnd = new Date(period.Tend);

        console.log(`Checking PeriodID: ${periodId}, Tstart: ${tStart}, Tend: ${tEnd}`);

        const query = {
          "Trip.coordinates": {
            $geoIntersects: {
              $geometry: region.geometry,
            },
          },
          $or: [
            { Tstart: { $gte: tStart, $lte: tEnd } },
            { Tend: { $gte: tStart, $lte: tEnd } },
            { Tstart: { $lte: tStart }, Tend: { $gte: tEnd } },
          ],
        };

        const trips = await tripsCollection.find(query).toArray();

        trips.forEach((trip) => {
          // Έλεγχος αν το Trip περιέχει έγκυρα δεδομένα
          if (!trip.Trip || !Array.isArray(trip.Trip) || trip.Trip.length === 0) {
            console.warn(`Skipping trip with missing or invalid coordinates: ${trip.MMSI}`);
            return;
          }

          const result = {
            RegionID: regionId,
            PeriodID: periodId,
            MMSI: trip.MMSI,
            Tstart: trip.Tstart,
            Tend: trip.Tend,
          };

       
          const coordinates = trip.Trip.slice(0, 5).map((point) => {
            if (point.type === "Point" && Array.isArray(point.coordinates)) {
              return point.coordinates;
            }
            return null;
          }).filter((coord) => coord !== null);

          if (coordinates.length > 0) {
            result.Trip = coordinates;
            const remainingPoints = trip.Trip.length - 5;
            if (remainingPoints > 0) {
              result.TripSummary = `Απομένουν ${remainingPoints} σημεία`;
            }
            results.push(result);
          } else {
            console.warn(`Skipping trip with invalid points: ${trip.MMSI}`);
          }
        });
      }
    }

    results.sort((a, b) => {
      if (a.RegionID !== b.RegionID) return a.RegionID.localeCompare(b.RegionID);
      if (a.PeriodID !== b.PeriodID) return a.PeriodID - b.PeriodID;
      return a.MMSI - b.MMSI;
    });

    console.timeEnd("Query Execution Time");

    console.log("Final Query Results (Sorted):");

    // Εγγραφή των αποτελεσμάτων σε αρχείο JSON
    const resultsJson = JSON.stringify(results, null, 2);
    fs.writeFileSync("trip_results.json", resultsJson);

    console.log("Results saved to 'trip_results.json'");

  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}


findTripsByRegionAndPeriod().catch(console.error);




//query 3.1
const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh";
const regionsCollectionName = "Regions";
const periodsCollectionName = "Periods";
const tripsCollectionName = "Trips";

async function findVesselPairsByRegionAndPeriod() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const regionsCollection = db.collection(regionsCollectionName);
    const periodsCollection = db.collection(periodsCollectionName);
    const tripsCollection = db.collection(tripsCollectionName);

    console.time("Query Execution Time");

    const regions = await regionsCollection.find({}).toArray();
    if (!regions.length) {
      console.log("No regions found.");
      console.timeEnd("Query Execution Time"); 
      return;
    }

    const periods = await periodsCollection.find({}).toArray();
    if (!periods.length) {
      console.log("No periods found.");
      console.timeEnd("Query Execution Time"); 
      return;
    }

    const results = [];

    for (const region of regions) {
      const regionId = region.RegionID;

      console.log(`Checking RegionID: ${regionId}`);

      for (const period of periods) {
        const periodId = period.PeriodId;
        const tStart = new Date(period.Tstart);
        const tEnd = new Date(period.Tend);

        console.log(`Checking PeriodID: ${periodId}, Tstart: ${tStart}, Tend: ${tEnd}`);

        const query = {
          "Trip.coordinates": {
            $geoIntersects: {
              $geometry: region.geometry,
            },
          },
          $or: [
            { Tstart: { $gte: tStart, $lte: tEnd } },
            { Tend: { $gte: tStart, $lte: tEnd } },
            { Tstart: { $lte: tStart }, Tend: { $gte: tEnd } },
          ],
        };

        const trips = await tripsCollection.find(query).toArray();

        if (trips.length < 2) {
          console.log(`Not enough vessels found for RegionID: ${regionId}, PeriodID: ${periodId}`);
          continue;
        }

        for (let i = 0; i < trips.length; i++) {
          for (let j = i + 1; j < trips.length; j++) {
            const vessel1 = trips[i];
            const vessel2 = trips[j];

            if (!vessel1.Trip || !vessel2.Trip) {
              console.warn(`Skipping pair with missing trip data: ${vessel1.MMSI}, ${vessel2.MMSI}`);
              continue;
            }

            const result = {
              Vessel1: vessel1.MMSI,
              Vessel2: vessel2.MMSI,
              RegionID: regionId,
              PeriodID: periodId,
            };

            results.push(result);
          }
        }
      }
    }

    results.sort((a, b) => {
      const vessel1A = String(a.Vessel1 || "");
      const vessel1B = String(b.Vessel1 || "");
      const vessel2A = String(a.Vessel2 || "");
      const vessel2B = String(b.Vessel2 || "");

      if (vessel1A !== vessel1B) return vessel1A.localeCompare(vessel1B);
      if (vessel2A !== vessel2B) return vessel2A.localeCompare(vessel2B);
      if (a.RegionID !== b.RegionID) return a.RegionID - b.RegionID;
      return a.PeriodID - b.PeriodID;
    });

    console.timeEnd("Query Execution Time"); 

    console.log("Final Query Results (Sorted):");

    // Εγγραφή των αποτελεσμάτων σε αρχείο JSON
    const resultsJson = JSON.stringify(results, null, 2);
    fs.writeFileSync("vessel_pairs_results.json", resultsJson);

    console.log("Results saved to 'vessel_pairs_results.json'");

  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}


findVesselPairsByRegionAndPeriod().catch(console.error);



//query 3.2 
const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh";
const regionsCollectionName = "Regions";
const periodsCollectionName = "Periods";
const tripsCollectionName = "Trips";

async function findVesselPairsByRegionAndPeriod() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const regionsCollection = db.collection(regionsCollectionName);
    const periodsCollection = db.collection(periodsCollectionName);
    const tripsCollection = db.collection(tripsCollectionName);

    console.time("Query Execution Time"); 

    const regions = await regionsCollection.find({}).toArray();
    if (!regions.length) {
      console.log("No regions found.");
      console.timeEnd("Query Execution Time"); 
      return;
    }

    const periods = await periodsCollection.find({}).toArray();
    if (!periods.length) {
      console.log("No periods found.");
      console.timeEnd("Query Execution Time"); 
      return;
    }

    const results = [];

    for (const region of regions) {
      const regionId = region.RegionID;

      console.log(`Checking RegionID: ${regionId}`);

      for (const period of periods) {
        const periodId = period.PeriodId;
        const tStart = new Date(period.Tstart);
        const tEnd = new Date(period.Tend);

        console.log(`Checking PeriodID: ${periodId}, Tstart: ${tStart}, Tend: ${tEnd}`);

        const query = {
          "Trip.coordinates": {
            $geoIntersects: {
              $geometry: region.geometry,
            },
          },
          $or: [
            { Tstart: { $gte: tStart, $lte: tEnd } },
            { Tend: { $gte: tStart, $lte: tEnd } },
            { Tstart: { $lte: tStart }, Tend: { $gte: tEnd } },
          ],
        };

        const trips = await tripsCollection.find(query).toArray();

        if (trips.length < 2) {
          console.log(`Not enough vessels found for RegionID: ${regionId}, PeriodID: ${periodId}`);
          continue;
        }

        for (let i = 0; i < trips.length; i++) {
          for (let j = i + 1; j < trips.length; j++) {
            const vessel1 = trips[i];
            const vessel2 = trips[j];

            if (!vessel1.Trip || !vessel2.Trip) {
              console.warn(`Skipping pair with missing trip data: ${vessel1.MMSI}, ${vessel2.MMSI}`);
              continue;
            }

            const result = {
              Vessel1: vessel1.MMSI,
              Vessel2: vessel2.MMSI,
              RegionID: regionId,
              PeriodID: periodId,
            };

            results.push(result);
          }
        }
      }
    }

    results.sort((a, b) => {
      const vessel1A = String(a.Vessel1 || "");
      const vessel1B = String(b.Vessel1 || "");
      const vessel2A = String(a.Vessel2 || "");
      const vessel2B = String(b.Vessel2 || "");

      if (vessel1A !== vessel1B) return vessel1A.localeCompare(vessel1B);
      if (vessel2A !== vessel2B) return vessel2A.localeCompare(vessel2B);
      if (a.RegionID !== b.RegionID) return a.RegionID - b.RegionID;
      return a.PeriodID - b.PeriodID;
    });

    console.timeEnd("Query Execution Time"); 

    console.log("Final Query Results (Sorted):");

    // Εγγραφή των αποτελεσμάτων σε αρχείο JSON
    const resultsJson = JSON.stringify(results, null, 2);
    fs.writeFileSync("vessel_pairs_results.json", resultsJson); 

    console.log("Results saved to 'vessel_pairs_results.json'");

  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}


findVesselPairsByRegionAndPeriod().catch(console.error);




//query 4 
const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh"; 
const aisCollectionName = "AISInputFiltered";
const pointsCollectionName = "Points";

async function findIntersectedVesselPoints() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const aisCollection = db.collection(aisCollectionName);
    const pointsCollection = db.collection(pointsCollectionName);

    console.time("Query Execution Time");

    // Ανάκτηση σημείων
    const points = await pointsCollection.find({}).toArray();
    if (!points.length) {
      console.log("No points found.");
      console.timeEnd("Query Execution Time"); 
      return;
    }

    // Ανάκτηση δεδομένων AIS
    const vessels = await aisCollection.find({}).toArray();
    if (!vessels.length) {
      console.log("No vessels found.");
      console.timeEnd("Query Execution Time"); 
      return;
    }

    const results = [];

    for (const point of points) {
      const pointId = point.PointId;
      const pointGeom = point.Geom;

      console.log(`Checking PointId: ${pointId}`);

      // Ερώτημα για εύρεση σκαφών που έχουν περάσει από το σημείο
      const query = {
        "geom": {
          $geoIntersects: {
            $geometry: pointGeom
          }
        }
      };

      const intersectedVessels = await aisCollection.find(query).toArray();

      if (intersectedVessels.length > 0) {
        intersectedVessels.forEach((vessel) => {
          const result = {
            MMSI: vessel.ship_id,
            PointId: pointId,
            Instant: vessel.timestamp
          };
          results.push(result);
        });
      }
    }

    // Ταξινόμηση των αποτελεσμάτων
    results.sort((a, b) => {
      if (a.MMSI !== b.MMSI) return a.MMSI - b.MMSI;
      if (a.PointId !== b.PointId) return a.PointId - b.PointId;
      return new Date(a.Instant) - new Date(b.Instant);
    });

    console.timeEnd("Query Execution Time"); 

    console.log("Intersected Vessel Points:");

    // Αποθήκευση των αποτελεσμάτων σε αρχείο JSON
    const resultsJson = JSON.stringify(results, null, 2);
    fs.writeFileSync("intersected_vessel_points.json", resultsJson);

    console.log("Results saved to 'intersected_vessel_points.json'");

  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}


findIntersectedVesselPoints().catch(console.error);



//query 7 
const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh"; 
const aisCollectionName = "AISInputFiltered";
const pointsCollectionName = "Points";

async function findIntersectedVesselPoints() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const aisCollection = db.collection(aisCollectionName);
    const pointsCollection = db.collection(pointsCollectionName);

    console.time("Query Execution Time");

    // Ανάκτηση σημείων
    const points = await pointsCollection.find({}).toArray();
    if (!points.length) {
      console.log("No points found.");
      console.timeEnd("Query Execution Time"); 
      return;
    }

    // Ανάκτηση δεδομένων AIS
    const vessels = await aisCollection.find({}).toArray();
    if (!vessels.length) {
      console.log("No vessels found.");
      console.timeEnd("Query Execution Time"); 
      return;
    }

    const results = [];

    for (const point of points) {
      const pointId = point.PointId;
      const pointGeom = point.Geom;

      console.log(`Checking PointId: ${pointId}`);

      // Ερώτημα για εύρεση σκαφών που έχουν περάσει από το σημείο
      const query = {
        "geom": {
          $geoIntersects: {
            $geometry: pointGeom
          }
        }
      };

      const intersectedVessels = await aisCollection.find(query).toArray();

      if (intersectedVessels.length > 0) {
        intersectedVessels.forEach((vessel) => {
          const result = {
            MMSI: vessel.ship_id,
            PointId: pointId,
            Instant: vessel.timestamp
          };
          results.push(result);
        });
      }
    }

    // Ταξινόμηση των αποτελεσμάτων
    results.sort((a, b) => {
      if (a.MMSI !== b.MMSI) return a.MMSI - b.MMSI;
      if (a.PointId !== b.PointId) return a.PointId - b.PointId;
      return new Date(a.Instant) - new Date(b.Instant);
    });

    console.timeEnd("Query Execution Time");

    console.log("Intersected Vessel Points:");

    // Αποθήκευση των αποτελεσμάτων σε αρχείο JSON
    const resultsJson = JSON.stringify(results, null, 2);
    fs.writeFileSync("intersected_vessel_points.json", resultsJson);

    console.log("Results saved to 'intersected_vessel_points.json'");

  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}


findIntersectedVesselPoints().catch(console.error);




//query 8
const { MongoClient } = require("mongodb");
const fs = require("fs");
const turf = require("@turf/turf");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh";
const aisCollectionName = "AISInputFiltered";
const periodsCollectionName = "Periods";

async function findIntersectingTrips() {
  const client = new MongoClient(uri);
  const startTime = Date.now(); 

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const aisCollection = db.collection(aisCollectionName);
    const periodsCollection = db.collection(periodsCollectionName);

    // Ανάκτηση περιόδων και δεδομένων AIS
    const [periods, aisData] = await Promise.all([
      periodsCollection.find().toArray(),
      aisCollection.find().toArray(),
    ]);

    console.log(`Found ${periods.length} periods and ${aisData.length} AIS records.`);

    if (periods.length === 0 || aisData.length === 0) {
      console.log("No data found in Periods or AISInputFiltered collections");
      return;
    }

    const results = [];

    for (const period of periods) {
      const { PeriodId, Tstart, Tend } = period;
      const periodStart = new Date(Tstart);
      const periodEnd = new Date(Tend);

      // Φιλτράρισμα AIS δεδομένων ανά χρονικό διάστημα
      const filteredAISData = aisData.filter(({ timestamp }) => {
        const time = new Date(timestamp);
        return time >= periodStart && time <= periodEnd;
      });

      if (filteredAISData.length === 0) {
        console.log(`No AIS data found for PeriodId: ${PeriodId}`);
        continue;
      }

      // Ομαδοποίηση των δεδομένων ανά MMSI
      const groupedByShip = filteredAISData.reduce((acc, data) => {
        (acc[data.ship_id] = acc[data.ship_id] || []).push(data);
        return acc;
      }, {});

      // Υπολογισμός απόστασης ανά σκάφος
      for (const [shipId, shipData] of Object.entries(groupedByShip)) {
        shipData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const validCoordinates = shipData
          .map(({ geom }) => (Array.isArray(geom?.coordinates) && geom.coordinates.length === 2 ? geom.coordinates : null))
          .filter(Boolean);

        if (validCoordinates.length < 2) {
          console.warn(`Insufficient valid coordinates for shipId: ${shipId} in PeriodId: ${PeriodId}`);
          continue;
        }

        const line = turf.lineString(validCoordinates);
        const distance = turf.length(line, { units: "meters" });

        results.push({ MMSI: shipId, PeriodId, Tstart, Tend, Distance: distance });
      }
    }

    fs.writeFileSync("vessel_distances.json", JSON.stringify(results, null, 2));
    console.log("Results saved to vessel_distances.json");

  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");

    const endTime = Date.now();
    console.log(`Execution time: ${(endTime - startTime) / 1000} seconds`);
  }
}

findIntersectingTrips().catch(console.error);






//query 9
const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh";

async function main() {
  const client = new MongoClient(uri);
  const startTime = Date.now(); 

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const pointsCollection = db.collection("Points");

    // Εκτέλεση του aggregation query
    const results = await pointsCollection.aggregate([
      {
        $lookup: {
          from: "Trips",
          let: { pointGeom: "$Geom.coordinates" },
          pipeline: [
            {
              $unwind: "$Trip",
            },
            {
              $project: {
                MMSI: 1,
                tripCoordinates: "$Trip.coordinates",
                distance: {
                  $sqrt: {
                    $add: [
                      {
                        $pow: [
                          {
                            $subtract: [
                              { $arrayElemAt: ["$$pointGeom", 0] },
                              { $arrayElemAt: ["$Trip.coordinates", 0] },
                            ],
                          },
                          2,
                        ],
                      },
                      {
                        $pow: [
                          {
                            $subtract: [
                              { $arrayElemAt: ["$$pointGeom", 1] },
                              { $arrayElemAt: ["$Trip.coordinates", 1] },
                            ],
                          },
                          2,
                        ],
                      },
                    ],
                  },
                },
              },
            },
            {
              $group: {
                _id: "$MMSI",
                MinDistance: { $min: "$distance" },
              },
            },
          ],
          as: "TripDistances",
        },
      },
      {
        $unwind: "$TripDistances",
      },
      {
        $project: {
          PointId: "$PointId",
          MMSI: "$TripDistances._id",
          MinDistance: "$TripDistances.MinDistance",
        },
      },
      {
        $addFields: {
          _id: { $concat: [{ $toString: "$PointId" }, "-", { $toString: "$MMSI" }] },
        },
      },
    ]).toArray();

    console.log("Query executed successfully");

    // Αποθήκευση των αποτελεσμάτων σε αρχείο JSON
    fs.writeFileSync("MinDistancesResults.json", JSON.stringify(results, null, 2));
    console.log("Results saved to 'MinDistancesResults.json'");

  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");

    const endTime = Date.now();
    console.log(`Execution time: ${(endTime - startTime) / 1000} seconds`);
  }
}

main().catch(console.error);




//query 10
const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const dbName = "ptuxiakh";

async function main() {
  const client = new MongoClient(uri);
  const startTime = Date.now();
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const tripsCollection = db.collection("Trips");

    const results = await tripsCollection.aggregate([
      {
        $lookup: {
          from: "Trips",
          let: { mmsi1: "$MMSI", trip1: "$Trip", t1Start: "$Tstart", t1End: "$Tend" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $lt: ["$MMSI", "$$mmsi1"] },
                    { $lt: ["$$mmsi1", 100000006] },
                    { $lt: ["$MMSI", 1000000010] },
                    {
                      $or: [
                        { $and: [{ $gte: ["$$t1Start", "$Tstart"] }, { $lte: ["$$t1Start", "$Tend"] }] },
                        { $and: [{ $gte: ["$Tstart", "$$t1Start"] }, { $lte: ["$Tstart", "$$t1End"] }] },
                        { $and: [{ $gte: ["$$t1End", "$Tstart"] }, { $lte: ["$$t1End", "$Tend"] }] },
                        { $and: [{ $gte: ["$Tend", "$$t1Start"] }, { $lte: ["$Tend", "$$t1End"] }] },
                        { $and: [{ $gte: ["$Tstart", "$$t1Start"] }, { $lte: ["$Tend", "$$t1End"] }] },
                        { $and: [{ $gte: ["$$t1Start", "$Tstart"] }, { $lte: ["$$t1End", "$Tend"] }] }
                      ]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                MMSI: 1,
                trip2: "$Trip",
                distance: {
                  $function: {
                    body: `function(trip1, trip2) {
                      function euclideanDist(a, b) {
                        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
                      }
                      let minDist = Infinity;
                      trip1.forEach(p1 => {
                        trip2.forEach(p2 => {
                          let dist = euclideanDist(p1, p2);
                          if (dist < minDist) minDist = dist;
                        });
                      });
                      return minDist;
                    }`,
                    args: ["$$trip1.coordinates", "$Trip.coordinates"],
                    lang: "js"
                  }
                }
              }
            },
            {
              $group: {
                _id: "$MMSI",
                MinDistance: { $min: "$distance" }
              }
            }
          ],
          as: "TripDistances"
        }
      },
      {
        $unwind: "$TripDistances"
      },
      {
        $project: {
          Vessel1: "$MMSI",
          Vessel2: "$TripDistances._id",
          MinDistance: "$TripDistances.MinDistance"
        }
      },
      {
        $sort: { Vessel1: 1, Vessel2: 1 }
      }
    ]).toArray();

    console.log("Query executed successfully");
    fs.writeFileSync("MinDistancesResults.json", JSON.stringify(results, null, 2));
    console.log("Results saved to 'MinDistancesResults.json'");
  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");

    const endTime = Date.now();
    console.log(`Execution time: ${(endTime - startTime) / 1000} seconds`);
  }
}

main().catch(console.error);








//query 11
const { MongoClient } = require("mongodb");
const turf = require("@turf/turf");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function findClosestShips() {
  try {
    console.time("Execution Time"); 

    await client.connect();
    const database = client.db("ptuxiakh");
    const collection = database.collection("AISInputFiltered");

    const ships = await collection.find({ ship_id: { $lt: 100000002 } }).toArray();

    const result = [];
    
    for (let i = 0; i < ships.length; i++) {
      const ship1 = ships[i];
      if (ship1.geom && ship1.geom.coordinates?.length === 2) {
        const coordinates1 = ship1.geom.coordinates;
        const point1 = turf.point([coordinates1[0], coordinates1[1]]);

        for (let j = i + 1; j < ships.length; j++) {
          const ship2 = ships[j];
          if (ship2.ship_id > ship1.ship_id && ship2.ship_id < 100000002 && ship1.ship_id < 100000002 && ship2.geom && ship2.geom.coordinates?.length === 2) {
            const coordinates2 = ship2.geom.coordinates;
            const point2 = turf.point([coordinates2[0], coordinates2[1]]);

            // Calculate the distance in meters
            const distanceMeters = turf.distance(point1, point2, { units: 'meters' });  
            const distanceNm = distanceMeters / 1852;

            if (distanceNm > 0) {
              const wktString = `LINESTRING(${coordinates1[0]} ${coordinates1[1]}, ${coordinates2[0]} ${coordinates2[1]})`;

              result.push({
                vessel1: ship1.ship_id,
                vessel2: ship2.ship_id,
                min: distanceNm,
                st_astext: wktString,
              });
            }
          }
        }
      }
    }

    if (result.length === 0) {
      console.log("Δεν βρέθηκαν αποτελέσματα.");
    } else {
      const csvHeader = `"vessel1","vessel2","min","st_astext"\n`;
      const csvRows = result.map(row => `${row.vessel1},${row.vessel2},"${row.min}","${row.st_astext}"`).join("\n");
      fs.writeFileSync("output.csv", csvHeader + csvRows);
      console.log("Τα αποτελέσματα αποθηκεύτηκαν στο output.csv");
    }

    console.timeEnd("Execution Time"); 
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await client.close();
  }
}

findClosestShips();
