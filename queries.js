// 1query 

const { MongoDBClient } = require("MongoDB"); 

 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh"; 

const regionsCollectionName = "Regions"; 

const tripsCollectionName = "Trips"; 

 

// Βήμα 2: Αναζήτηση Trips που αλληλεπιδρούν με το Polygon 

async function findTripsIntersectingPolygon(regionId) { 

  const client = new MongoDBClient(uri); 

 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const regionsCollection = db.collection(regionsCollectionName); 

    const tripsCollection = db.collection(tripsCollectionName); 

 

    // Βρίσκουμε το Polygon με το συγκεκριμένο RegionID 

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

 

    if (trips.length > 0) { 

      console.log(`${trips.length} trips intersect with the polygon:`); 

      

      // Ταξινόμηση των trips με βάση το MMSI

      trips.sort((a, b) => a.MMSI - b.MMSI); // αύξουσα ταξινόμηση του MMSI 

 

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

  // Αναζήτηση trips που αλληλεπιδρούν με το Polygon για RegionID 1 

  await findTripsIntersectingPolygon(1); 

} 

 

main().catch(console.error); 

//1 query 

const { MongoDBClient } = require("MongoDB"); 

 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh"; 

const regionsCollectionName = "Regions"; 

const tripsCollectionName = "Trips"; 

 

// Βήμα 2: Αναζήτηση Trips που αλληλεπιδρούν με το Polygon 

async function findTripsIntersectingPolygon(regionId) { 

  const client = new MongoDBClient(uri); 

 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const regionsCollection = db.collection(regionsCollectionName); 

    const tripsCollection = db.collection(tripsCollectionName); 

 

    // Βρίσκουμε το Polygon με το συγκεκριμένο RegionID 

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

  // Αναζήτηση trips που αλληλεπιδρούν με το Polygon για RegionID 2 

  await findTripsIntersectingPolygon(2); 

} 

 

main().catch(console.error); 



// query2 sorted mmsi 

const { MongoDBClient } = require("MongoDB"); 

 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh"; 

const regionsCollectionName = "Regions"; 

const periodsCollectionName = "Periods"; 

const aisCollectionName = "AISInputFiltered"; 

 

async function findUniqueVesselsByRegionAndPeriod() { 

  const client = new MongoDBClient(uri); 

 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const regionsCollection = db.collection(regionsCollectionName); 

    const periodsCollection = db.collection(periodsCollectionName); 

    const aisCollection = db.collection(aisCollectionName); 

 

    // Φέρνουμε όλα τα Regions 

    const regions = await regionsCollection.find({}).toArray(); 

    if (!regions.length) { 

      console.log("No regions found."); 

      return; 

    } 

 

    // Φέρνουμε όλες τις χρονικές περιόδους 

    const periods = await periodsCollection.find({}).toArray(); 

    if (!periods.length) { 

      console.log("No periods found."); 

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

 

        // προσθέτουμε τα μοναδικά MMSI στα αποτελέσματα 

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

      if (a.RegionID !== b.RegionID) return a.RegionID.localeCompare(b.RegionID); // Ταξινόμηση RegionID 

      if (a.PeriodID !== b.PeriodID) return a.PeriodID - b.PeriodID; // Ταξινόμηση PeriodID 

      return a.MMSI - b.MMSI; // Ταξινόμηση MMSI 

    }); 

 

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

const { MongoDBClient } = require("MongoDB"); 

const fs = require("fs"); // Εισαγωγή του fs module για να γράψει σε αρχείο 

 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh"; 

const regionsCollectionName = "Regions"; 

const periodsCollectionName = "Periods"; 

const tripsCollectionName = "Trips"; 

 

async function findTripsByRegionAndPeriod() { 

  const client = new MongoDBClient(uri); 

 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const regionsCollection = db.collection(regionsCollectionName); 

    const periodsCollection = db.collection(periodsCollectionName); 

    const tripsCollection = db.collection(tripsCollectionName); 

 

    const regions = await regionsCollection.find({}).toArray(); 

    if (!regions.length) { 

      console.log("No regions found."); 

      return; 

    } 

 

    const periods = await periodsCollection.find({}).toArray(); 

    if (!periods.length) { 

      console.log("No periods found."); 

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

 

          // Συλλογή των πρώτων 5 σημείων 

          const coordinates = trip.Trip.slice(0, 5).map((point) => { 

            if (point.type === "Point" && Array.isArray(point.coordinates)) { 

              return point.coordinates; 

            } 

            return null; 

          }).filter((coord) => coord !== null); // Απορρίπτουμε μη έγκυρα σημεία 

 

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

 

    console.log("Final Query Results (Sorted):"); 

 

    // Εγγραφή των αποτελεσμάτων σε αρχείο JSON 

    const resultsJson = JSON.stringify(results, null, 2); 

    fs.writeFileSync("trip_results.json", resultsJson); // Αποθήκευση στο αρχείο 

 

    console.log("Results saved to 'trip_results.json'"); 

 

  } catch (err) { 

    console.error("An error occurred:", err); 

  } finally { 

    await client.close(); 

    console.log("MongoDB connection closed"); 

  } 

} 

 

findTripsByRegionAndPeriod().catch(console.error); 

//query 3 

const { MongoDBClient } = require("MongoDB"); 

const fs = require("fs"); // Εισαγωγή του fs module για να γράψει σε αρχείο 

 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh"; 

const regionsCollectionName = "Regions"; 

const periodsCollectionName = "Periods"; 

const tripsCollectionName = "Trips"; 

 

async function findVesselPairsByRegionAndPeriod() { 

  const client = new MongoDBClient(uri); 

 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const regionsCollection = db.collection(regionsCollectionName); 

    const periodsCollection = db.collection(periodsCollectionName); 

    const tripsCollection = db.collection(tripsCollectionName); 

 

    const regions = await regionsCollection.find({}).toArray(); 

    if (!regions.length) { 

      console.log("No regions found."); 

      return; 

    } 

 

    const periods = await periodsCollection.find({}).toArray(); 

    if (!periods.length) { 

      console.log("No periods found."); 

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

 

        console.log( 

          `Checking PeriodID: ${periodId}, Tstart: ${tStart}, Tend: ${tEnd}` 

        ); 

 

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

          console.log( 

            `Not enough vessels found for RegionID: ${regionId}, PeriodID: ${periodId}` 

          ); 

          continue; 

        } 

 

        for (let i = 0; i < trips.length; i++) { 

          for (let j = i + 1; j < trips.length; j++) { 

            const vessel1 = trips[i]; 

            const vessel2 = trips[j]; 

 

            if (!vessel1.Trip || !vessel2.Trip) { 

              console.warn( 

                `Skipping pair with missing trip data: ${vessel1.MMSI}, ${vessel2.MMSI}` 

              ); 

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

 

    console.log("Final Query Results (Sorted):"); 

 

    // Εγγραφή των αποτελεσμάτων σε αρχείο JSON 

    const resultsJson = JSON.stringify(results, null, 2); 

    fs.writeFileSync("vessel_pairs_results.json", resultsJson); // Αποθήκευση στο αρχείο 

 

    console.log("Results saved to 'vessel_pairs_results.json'"); 

 

  } catch (err) { 

    console.error("An error occurred:", err); 

  } finally { 

    await client.close(); 

    console.log("MongoDB connection closed"); 

  } 

} 

 
findVesselPairsByRegionAndPeriod().catch(console.error); 


//query 3_2 

const { MongoDBClient } = require("MongoDB"); 

const fs = require("fs");

 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh"; 

const regionsCollectionName = "Regions"; 

const periodsCollectionName = "Periods"; 

const tripsCollectionName = "Trips"; 

 

async function findVesselPairsByRegionAndPeriod() { 

  const client = new MongoDBClient(uri); 

 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const regionsCollection = db.collection(regionsCollectionName); 

    const periodsCollection = db.collection(periodsCollectionName); 

    const tripsCollection = db.collection(tripsCollectionName); 

 

    // Ανάκτηση των περιοχών και των περιόδων 

    const regions = await regionsCollection.find({}).toArray(); 

    if (!regions.length) { 

      console.log("No regions found."); 

      return; 

    } 

 

    const periods = await periodsCollection.find({}).toArray(); 

    if (!periods.length) { 

      console.log("No periods found."); 

      return; 

    } 

 

    const results = []; 

 

    // Επανάληψη για κάθε περιοχή και περίοδο 

    for (const region of regions) { 

      const regionId = region.RegionID; 

 

      console.log(`Checking RegionID: ${regionId}`); 

 

      for (const period of periods) { 

        const periodId = period.PeriodId; 

        const tStart = new Date(period.Tstart); 

        const tEnd = new Date(period.Tend); 

 

        console.log( 

          `Checking PeriodID: ${periodId}, Tstart: ${tStart}, Tend: ${tEnd}` 

        ); 

 

        // Δημιουργία του query για την εύρεση των ταξιδιών 

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

 

        // Ανάκτηση των ταξιδιών που πληρούν τα κριτήρια 

        const trips = await tripsCollection.find(query).toArray(); 

 

        if (trips.length < 2) { 

          console.log( 

            `Not enough vessels found for RegionID: ${regionId}, PeriodID: ${periodId}` 

          ); 

          continue; 

        } 

 

        // Δημιουργία των ζευγαριών πλοίων 

        for (let i = 0; i < trips.length; i++) { 

          for (let j = i + 1; j < trips.length; j++) { 

            const vessel1 = trips[i]; 

            const vessel2 = trips[j]; 

 

            if (!vessel1.Trip || !vessel2.Trip) { 

              console.warn( 

                `Skipping pair with missing trip data: ${vessel1.MMSI}, ${vessel2.MMSI}` 

              ); 

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

 

    // Ταξινόμηση των αποτελεσμάτων 

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

 

    console.log("Final Query Results (Sorted):", results); 

 

    // Εγγραφή των αποτελεσμάτων σε αρχείο JSON 

    const resultsJson = JSON.stringify(results, null, 2); 

    fs.writeFileSync("vessel_pairs_results.json", resultsJson); // Αποθήκευση στο αρχείο 

 

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

const { MongoDBClient } = require("MongoDB"); 

const fs = require("fs"); 

 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh"; 
const aisCollectionName = "AISInputFiltered"; 

const pointsCollectionName = "Points"; 

 

async function findIntersectedVesselPoints() { 

  const client = new MongoDBClient(uri); 

 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const aisCollection = db.collection(aisCollectionName); 

    const pointsCollection = db.collection(pointsCollectionName); 

 

    // Βρίσκουμε όλα τα σημεία από τη συλλογή Points 

    const points = await pointsCollection.find({}).toArray(); 

    if (!points.length) { 

      console.log("No points found."); 

      return; 

    } 

 

    // Βρίσκουμε όλα τα δεδομένα από τη συλλογή AISInputFiltered 

    const vessels = await aisCollection.find({}).toArray(); 

    if (!vessels.length) { 

      console.log("No vessels found."); 

      return; 

    } 

 

    const results = []; 

 

    // Για κάθε σημείο, ελέγχουμε αν κάποιο σκάφος το έχει περάσει 

    for (const point of points) { 

      const pointId = point.PointId; 

      const pointGeom = point.Geom; 

 

      console.log(`Checking PointId: ${pointId}`); 

 

      // βρίσκουμε τα σκάφη που επικαλύπτονται με το σημείο 

      const query = { 

        "geom": { 

          $geoIntersects: { 

            $geometry: pointGeom 

          } 

        } 

      }; 

 

      const intersectedVessels = await aisCollection.find(query).toArray(); 

 

      if (intersectedVessels.length > 0) { 

        // Για κάθε σκάφος που επικαλύπτεται, παίρνουμε το πρώτο χρονικό στιγμιότυπο (MIN) 

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

 

    // Ταξινομούμε τα αποτελέσματα 

    results.sort((a, b) => { 

      if (a.MMSI !== b.MMSI) return a.MMSI - b.MMSI; 

      if (a.PointId !== b.PointId) return a.PointId - b.PointId; 

      return new Date(a.Instant) - new Date(b.Instant); 

    }); 

 

    console.log("Intersected Vessel Points:"); 

    console.log(results); 

 

    // Αποθήκευση των αποτελεσμάτων σε αρχείο JSON 

    const resultsJson = JSON.stringify(results, null, 2); 

    fs.writeFileSync("intersected_vessel_points.json", resultsJson); // Αποθήκευση στο αρχείο 

 

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

const { MongoDBClient } = require("MongoDB"); 

const fs = require("fs"); 

const turf = require("@turf/turf"); 

 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh"; 

const aisCollectionName = "AISInputFiltered"; 

const periodsCollectionName = "Periods"; 

 

async function findIntersectingTrips() { 

  const client = new MongoDBClient(uri); 

 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const aisCollection = db.collection(aisCollectionName); 

    const periodsCollection = db.collection(periodsCollectionName); 

 

    // Βρίσκουμε τις περιόδους 

    const periods = await periodsCollection.find().toArray(); 

    console.log("Number of Periods:", periods.length); 

    console.log("Periods Data:", periods); 

 

    // Βρίσκουμε τα δεδομένα AIS 

    const aisData = await aisCollection.find().toArray(); 

    console.log("Number of AIS Data:", aisData.length); 

    console.log("AIS Data:", aisData); 

 

    if (periods.length === 0 || aisData.length === 0) { 

      console.log("No data found in Periods or AISInputFiltered collections"); 

      return; 

    } 

 

    const results = []; 

 

    // Επεξεργαζόμαστε τις περιόδους 

    for (const period of periods) { 

      const { PeriodId, Tstart, Tend } = period; 

 

      // Φιλτράρουμε τα δεδομένα AIS για την τρέχουσα περίοδο 

      const filteredAISData = aisData.filter((data) => { 

        const timestamp = new Date(data.timestamp); 

        // Ελέγχουμε αν το timestamp είναι εντός της περιόδου 

        return timestamp >= new Date(Tstart) && timestamp <= new Date(Tend); 

      }); 

 

      if (filteredAISData.length === 0) { 

        console.log(`No data for PeriodId: ${PeriodId}`); 

        continue; 

      } 

 

      // Ομαδοποιούμε τα δεδομένα AIS ανά ship_id (MMSI) 

      const groupedByShip = filteredAISData.reduce((acc, data) => { 

        if (!acc[data.ship_id]) { 

          acc[data.ship_id] = []; 

        } 

        acc[data.ship_id].push(data); 

        return acc; 

      }, {}); 

 

      // Υπολογίζουμε την απόσταση για κάθε ship_id 

      for (const shipId in groupedByShip) { 

        const shipData = groupedByShip[shipId]; 

 

        // Ταξινομούμε τα δεδομένα με βάση το timestamp

        shipData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); 

 

        // Φιλτράρουμε τα δεδομένα για να βεβαιωθούμε ότι οι συντεταγμένες είναι σωστές 

        const validCoordinates = shipData 

          .map((data) => { 

            const coordinates = data.geom?.coordinates; 

            // Ελέγχουμε αν οι συντεταγμένες είναι έγκυρες

            if (Array.isArray(coordinates) && coordinates.length === 2) { 

              return [coordinates[0], coordinates[1]]; // [longitude, latitude] 

            } 

            return null; 

          }) 

          .filter((coords) => coords !== null); 
 

        if (validCoordinates.length < 2) { 

          console.log(`Not enough valid coordinates for shipId: ${shipId} in PeriodId: ${PeriodId}`); 

          continue; 

        } 

 

        // Δημιουργούμε μια γραμμή με τα γεωμετρικά σημεία (σημεία AIS) 

        const line = turf.lineString(validCoordinates); 

 

        // Υπολογίζουμε την απόσταση σε μέτρα 

        const distance = turf.length(line, { units: "meters" }); 

 

        results.push({ 

          MMSI: shipId, 

          PeriodId: PeriodId, 

          Tstart: Tstart, 

          Tend: Tend, 

          Distance: distance, 

        }); 

      } 

    } 

 

    // Αποθηκεύουμε τα αποτελέσματα σε αρχείο JSON 

    fs.writeFileSync("vessel_distances.json", JSON.stringify(results, null, 2)); 

    console.log("Results saved to vessel_distances.json"); 

 

  } catch (err) { 

    console.error("An error occurred:", err); 

  } finally { 

    await client.close(); 

    console.log("MongoDB connection closed"); 

  } 

} 

 
findIntersectingTrips().catch(console.error); 


//query 8 

const { MongoDBClient } = require("MongoDB"); 

const fs = require("fs"); 

const turf = require("@turf/turf"); 

 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh";

const aisCollectionName = "AISInputFiltered"; 

const periodsCollectionName = "Periods";

 

async function findIntersectingTrips() { 

  const client = new MongoDBClient(uri); 

 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const aisCollection = db.collection(aisCollectionName); 

    const periodsCollection = db.collection(periodsCollectionName); 

 

    // Βρίσκουμε τις περιόδους 

    const periods = await periodsCollection.find().toArray(); 

    console.log("Number of Periods:", periods.length); 

    console.log("Periods Data:", periods); 

 

    // Βρίσκουμε τα δεδομένα AIS 

    const aisData = await aisCollection.find().toArray(); 

    console.log("Number of AIS Data:", aisData.length); 

    console.log("AIS Data:", aisData); 

 

    if (periods.length === 0 || aisData.length === 0) { 

      console.log("No data found in Periods or AISInputFiltered collections"); 

      return; 

    } 

 

    const results = []; 

 

    // Επεξεργαζόμαστε τις περιόδους 

    for (const period of periods) { 

      const { PeriodId, Tstart, Tend } = period; 

 

      // Φιλτράρουμε τα δεδομένα AIS για την τρέχουσα περίοδο 

      const filteredAISData = aisData.filter((data) => { 

        const timestamp = new Date(data.timestamp); 

        // Ελέγχουμε αν το timestamp είναι εντός της περιόδου 

        return timestamp >= new Date(Tstart) && timestamp <= new Date(Tend); 

      }); 

 

      if (filteredAISData.length === 0) { 

        console.log(`No data for PeriodId: ${PeriodId}`); 

        continue; 

      } 

 

      // Ομαδοποιούμε τα δεδομένα AIS ανά ship_id (MMSI) 

      const groupedByShip = filteredAISData.reduce((acc, data) => { 

        if (!acc[data.ship_id]) { 

          acc[data.ship_id] = []; 

        } 

        acc[data.ship_id].push(data); 

        return acc; 

      }, {}); 

 

      // Υπολογίζουμε την απόσταση για κάθε ship_id 

      for (const shipId in groupedByShip) { 

        const shipData = groupedByShip[shipId]; 

 

        // Ταξινομούμε τα δεδομένα με βάση το timestamp

        shipData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); 

 

        // Φιλτράρουμε τα δεδομένα για να βεβαιωθούμε ότι οι συντεταγμένες είναι σωστές 

        const validCoordinates = shipData 

          .map((data) => { 

            const coordinates = data.geom?.coordinates; 

            // Ελέγχουμε αν οι συντεταγμένες είναι έγκυρες

            if (Array.isArray(coordinates) && coordinates.length === 2) { 

              return [coordinates[0], coordinates[1]]; // [longitude, latitude] 

            } 

            return null; 

          }) 

          .filter((coords) => coords !== null);

 

        if (validCoordinates.length < 2) { 

          console.log(`Not enough valid coordinates for shipId: ${shipId} in PeriodId: ${PeriodId}`); 


          console.log(`Invalid Coordinates for shipId: ${shipId} in PeriodId: ${PeriodId}:`, shipData); 

          continue; 

        } 

 

        // Δημιουργούμε μια γραμμή με τα γεωμετρικά σημεία (σημεία AIS) 

        const line = turf.lineString(validCoordinates); 

 

        // Υπολογίζουμε την απόσταση σε μέτρα 

        const distance = turf.length(line, { units: "meters" }); 

 

        results.push({ 

          MMSI: shipId, 

          PeriodId: PeriodId, 

          Tstart: Tstart, 

          Tend: Tend, 

          Distance: distance, 

        }); 

      } 

    } 

 

    // Αποθηκεύουμε τα αποτελέσματα σε αρχείο JSON 

    fs.writeFileSync("vessel_distances2.json", JSON.stringify(results, null, 2)); 

    console.log("Results saved to vessel_distances.json"); 

 

  } catch (err) { 

    console.error("An error occurred:", err); 

  } finally { 

    await client.close(); 

    console.log("MongoDB connection closed"); 

  } 

} 

findIntersectingTrips().catch(console.error);


//query 9 

const { MongoDBClient } = require("MongoDB"); 

const fs = require("fs"); 

 

// Στοιχεία σύνδεσης 

const uri = "MongoDB://localhost:27017"; 

const dbName = "ptuxiakh"; 

 

async function main() { 

  const client = new MongoDBClient(uri); 

 

  try { 

    // Σύνδεση με τη βάση δεδομένων 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const db = client.db(dbName); 

    const pointsCollection = db.collection("Points"); 

 
 

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

                      { $pow: [{ $subtract: [{ $arrayElemAt: ["$$pointGeom", 0] }, { $arrayElemAt: ["$Trip.coordinates", 0] }] }, 2] }, 

                      { $pow: [{ $subtract: [{ $arrayElemAt: ["$$pointGeom", 1] }, { $arrayElemAt: ["$Trip.coordinates", 1] }] }, 2] }, 

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

          _id: { $concat: [{$toString: "$PointId"}, "-", {$toString: "$MMSI"}] } 

        } 

      } 

    ]).toArray(); 

 

    console.log("Query executed successfully"); 

 

    // Αποθήκευση των αποτελεσμάτων σε αρχείο JSON 

    fs.writeFileSync("MinDistancesResults.json", JSON.stringify(results, null, 2)); 

    console.log("Results saved to 'MinDistancesResults.json'"); 

 

  } catch (err) { 

    console.error("An error occurred:", err); 

  } finally { 

    // Κλείσιμο σύνδεσης 

    await client.close(); 

    console.log("MongoDB connection closed"); 

  } 

} 

 

main().catch(console.error); 



// query 10 

const { MongoDBClient } = require("MongoDB"); 

const fs = require("fs"); 

 

const uri = "MongoDB://localhost:27017"; 

const client = new MongoDBClient(uri); 

 

async function findMinTemporalDistances() { 

    try { 

        await client.connect(); 

        const database = client.db("ptuxiakh"); 

        const collection = database.collection("Trips"); 

 

        // Φέρνει μόνο τα αποτελέσματα που ισχύουν MMSI < 100000003 για γρηγορότερη εκτέλεση 

        const trips = await collection.find( 

            { MMSI: { $lt: 100000003 } } 

        ).toArray(); 

 

        const results = []; 

 

        function haversineDistance(coord1, coord2) { 

            const R = 6371; // Ακτίνα της Γης σε km 

            const lat1 = coord1[1] * (Math.PI / 180); 

            const lat2 = coord2[1] * (Math.PI / 180); 

            const deltaLat = (coord2[1] - coord1[1]) * (Math.PI / 180); 

            const deltaLon = (coord2[0] - coord1[0]) * (Math.PI / 180); 

 

            const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + 

                      Math.cos(lat1) * Math.cos(lat2) * 

                      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2); 

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 

 

            return R * c; // Απόσταση σε km 

        } 

 

        for (let i = 0; i < trips.length; i++) { 

            for (let j = i + 1; j < trips.length; j++) { 

                const trip1 = trips[i]; 

                const trip2 = trips[j]; 

 

                if ( 

                    (trip1.Tstart >= trip2.Tstart && trip1.Tstart <= trip2.Tend) || 

                    (trip2.Tstart >= trip1.Tstart && trip2.Tstart <= trip1.Tend) || 

                    (trip1.Tend >= trip2.Tstart && trip1.Tend <= trip2.Tend) || 

                    (trip2.Tend >= trip1.Tstart && trip2.Tend <= trip1.Tend) || 

                    (trip2.Tstart >= trip1.Tstart && trip2.Tend <= trip1.Tend) || 

                    (trip1.Tstart >= trip2.Tstart && trip1.Tend <= trip2.Tend) 

                ) { 

                    let minDistance = Infinity; 

 

                    for (let p1 of trip1.Trip) { 

                        for (let p2 of trip2.Trip) { 

                            const distance = haversineDistance(p1.coordinates, p2.coordinates); 

                            const distanceInDegrees = distance / 111.32; 

 

                            if (distanceInDegrees < minDistance) { 

                                minDistance = distanceInDegrees; 

                            } 

                        } 

                    } 

 

                    results.push({ 

                        Vessel1: trip1.MMSI, 

                        Vessel2: trip2.MMSI, 

                        MinDistance: minDistance.toFixed(12) 

                    }); 

                } 

            } 

        } 

 

        console.log("Results:", results); 

 

        const csvContent = `"vessel1","vessel2","mindistance"\n` + 

            results.map(r => `${r.Vessel1},${r.Vessel2},"${r.MinDistance}"`).join("\n"); 

 

        fs.writeFileSync("min_temporal_distances.csv", csvContent); 

 

    } catch (error) { 

        console.error("Error:", error); 

    } finally { 

        await client.close(); 

    } 

} 

 

findMinTemporalDistances(); 


//query 11 

const { MongoDBClient } = require("MongoDB"); 

const turf = require("@turf/turf"); 

const fs = require("fs"); 

 

const uri = "MongoDB://localhost:27017";

const client = new MongoDBClient(uri); 

 

async function findClosestShips() { 

  try { 

    console.time("Execution Time"); // Ξεκινάμε την μέτρηση χρόνου 

 

    await client.connect(); 

    const database = client.db("ptuxiakh");

    const collection = database.collection("AISInputFiltered"); 

 

    const ships = await collection.find().toArray(); 

 

    // Εκτυπώνουμε τα MMSI από τα σκάφη για να δούμε ποια έχουμε στη βάση 

    const mmsiList = ships.map(ship => ship.ship_id); 

    console.log("List of MMSI:", mmsiList); 

 

    if (mmsiList.length === 0) { 

      console.log("Δεν υπάρχουν σκάφη στη βάση δεδομένων."); 

      return; 

    } 

 

    const result = []; 

    let count = 0; 

 

    // Ελέγχουμε για τις συντεταγμένες στο πεδίο geom 

    for (let i = 0; i < ships.length; i++) { 

      const ship1 = ships[i]; 

 

      // Αν το MMSI είναι ίδιο για τα δύο σκάφη, το παρακάμπτουμε 

      if (ship1.geom && ship1.geom.coordinates && ship1.geom.coordinates.length === 2) { 

        const coordinates1 = ship1.geom.coordinates; 

        const point1 = turf.point([coordinates1[0], coordinates1[1]]); // [longitude, latitude] 

 

        console.log(`Ship1 MMSI: ${ship1.ship_id}, Coordinates: ${coordinates1}`); 

 

        for (let j = i + 1; j < ships.length; j++) { 

          const ship2 = ships[j]; 

 

          // Αν το MMSI είναι το ίδιο ή δεν υπάρχουν συντεταγμένες για το δεύτερο σκάφος, το παρακάμπτουμε 

          if (ship2.ship_id !== ship1.ship_id && ship2.geom && ship2.geom.coordinates && ship2.geom.coordinates.length === 2) { 

            const coordinates2 = ship2.geom.coordinates; 

            const point2 = turf.point([coordinates2[0], coordinates2[1]]); // [longitude, latitude] 

 

            console.log(`Ship2 MMSI: ${ship2.ship_id}, Coordinates: ${coordinates2}`); 

 

            // Υπολογίζουμε την απόσταση μεταξύ των δύο σκαφών σε μέτρα  

            const distanceMeters = turf.distance(point1, point2, { units: 'meters' });  // Απόσταση σε μέτρα 

 

            // Μετατρέπουμε την απόσταση σε ναυτικά μίλια 

            const distanceNm = distanceMeters / 1852; 

 

            console.log(`Distance between ${ship1.ship_id} and ${ship2.ship_id}: ${distanceNm} nautical miles`); 

 

            if (distanceNm > 0) { 

              // Δημιουργούμε τη γραμμή μεταξύ των δύο σημείων 

              const line = turf.lineString([coordinates1, coordinates2]); 

 


              const wktString = `LINESTRING(${coordinates1[0]} ${coordinates1[1]}, ${coordinates2[0]} ${coordinates2[1]})`; 

 

              // Προσθέτουμε το αποτέλεσμα στην λίστα 

              result.push({ 

                vessel1: ship1.ship_id, 

                vessel2: ship2.ship_id, 

                min: distanceNm,  // Χρησιμοποιούμε την απόσταση σε ναυτικά μίλια 

                st_astext: wktString, 

              }); 

 

              // Ελέγχουμε αν έχουμε ξεπεράσει το όριο των αποτελεσμάτων 

              count++; 

              if (count >= 1000) { 

                console.log("Φτάσαμε το όριο των 1000 αποτελεσμάτων."); 

                break; 

              } 

            } 

          } 

        } 

      } 

      if (count >= 1000) break; 

    } 

 

    if (result.length === 0) { 

      console.log("Δεν βρέθηκαν αποτελέσματα."); 

    } else { 

      // Δημιουργούμε το CSV string 

      const csvHeader = `"vessel1","vessel2","min","st_astext"\n`; 

      const csvRows = result.map(row => { 

        return `${row.vessel1},${row.vessel2},"${row.min}","${row.st_astext}"`; 

      }).join("\n"); 

 

      const outputFile = "output.csv"; 

 

      // Γράφουμε τα δεδομένα στο αρχείο CSV 

      fs.writeFileSync(outputFile, csvHeader + csvRows); 

 

      console.log(`Τα αποτελέσματα αποθηκεύτηκαν στο αρχείο ${outputFile}`); 

    } 

 

    console.timeEnd("Execution Time"); // Τελειώνουμε την μέτρηση χρόνου 

  } catch (error) { 

    console.error("An error occurred:", error); 

  } finally { 

    await client.close(); 

  } 

} 

 

findClosestShips(); 
