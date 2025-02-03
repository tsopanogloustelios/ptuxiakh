const express = require('express'); 

const path = require('path'); 

const { MongoDBClient } = require('MongoDB'); 

const app = express(); 

const PORT = 3000; 

const uri = 'MongoDB://localhost:27017'; 

 

// Συνδεση με MongoDB και εισαγωγή πολυγώνων 

async function insertPolygons() { 

  const client = new MongoDBClient(uri); 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const database = client.db("ptuxiakh"); 

    const collection = database.collection("Regions"); 

 

    // όρισμος δύο πολυγόνων με  μοναδίκο RegionID και συντεταγμένες(Define two polygons with unique RegionID and coordinates) 

    const polygons = [ 

      { 

        RegionID: "1", 

        geometry: { 

          type: "Polygon", 

          coordinates: [ 

            [ 

              [23.585103, 37.933684], [23.572229, 37.936528], [23.570684, 37.949524], 

              [23.579953, 37.954667], [23.589223, 37.955209], [23.597634, 37.946816], 

              [23.585103, 37.933684] 

            ] 

          ] 

        } 

      }, 

      { 

        RegionID: "2", 

        geometry: { 

          type: "Polygon",  
            coordinates: [ 

            [ 

              [23.622697, 37.563405], [23.555406, 37.663487], [23.62819, 37.736288], 

              [23.786119, 37.709675], [23.783372, 37.57429], [23.622697, 37.563405] 

            ] 

          ] 

        } 

      } 

    ]; 

 

    // Εισαγωγή πολυγώνων στη MongoDB 

    const result = await collection.insertMany(polygons); 

    console.log(`Polygons inserted with IDs: ${result.insertedIds}`); 

  } catch (error) { 

    console.error("Error inserting polygons:", error); 

  } finally { 

    await client.close(); 

  } 

} 

 

// Σύνδεση ξάνα στην MongoDB και εισαγωγή τον trips 

async function insertTrips() { 

  const client = new MongoDBClient(uri); 

  try { 

    await client.connect(); 

    console.log("Connected to MongoDB"); 

 

    const database = client.db("ptuxiakh"); 

    const aisCollection = database.collection("AISInputFiltered"); 

    const vesselsCollection = database.collection("Vessels"); 

    const tripsCollection = database.collection("Trips"); 

 

    // Εύρεση των δεδομένων από το AISInputFiltered 

    const aisData = await aisCollection.find().toArray(); 

    const vesselsData = await vesselsCollection.find().toArray(); 

 

    // Ελέγχουμε τα δεδομένα πριν τη δημιουργία των trips 

    console.log("AIS Data:", aisData); 

    console.log("Vessels Data:", vesselsData); 

 

    // Δημιουργία των trips 

    const trips = aisData.reduce((acc, data) => { 
                        const { ship_id, geom, timestamp } = data; 

 

      // Ελέγχουμε αν υπάρχουν τα απαραίτητα πεδία για την δημιουργία τους 

      if (!ship_id || !geom || !timestamp) { 

        console.log(`Skipping invalid data (missing MMSI, Geom, or T): ${JSON.stringify(data)}`); 

        return acc; 

      } 

 

      // Ελέγχουμε αν το MMSI υπάρχει στον πίνακα Vessels 

      const vessel = vesselsData.find(v => v.MMSI === ship_id); 

      if (!vessel) { 

        console.log(`Skipping invalid MMSI (not found in Vessels): ${ship_id}`); 

        return acc; 

      } 

 

      // Αν δεν υπάρχει trip για το συγκεκριμένο MMSI, δημιουργούμε ένα νέο 

      let trip = acc.find(t => t.MMSI === ship_id); 

      if (!trip) { 

        trip = { MMSI: ship_id, Trip: [], Tstart: new Date(timestamp), Tend: new Date(timestamp) }; 

        acc.push(trip); 

      } 

 

      // Προσθέτουμε το Geom και ενημερώνουμε τα Tstart και Tend 

      trip.Trip.push(geom); 

      const currentTimestamp = new Date(timestamp); 

      if (currentTimestamp < trip.Tstart) trip.Tstart = currentTimestamp; 

      if (currentTimestamp > trip.Tend) trip.Tend = currentTimestamp; 

 

      return acc; 

    }, []); 

 

    // Ελέγχουμε τα trips πριν την αποθήκευση 

    console.log("Trips data:", trips); 

 

    // Εισαγωγή των trips στη συλλογή "Trips" 

    const result = await tripsCollection.insertMany(trips); 

    console.log(`Trips inserted with IDs: ${result.insertedIds}`); 

     } catch (error) { 

    console.error("Error inserting trips:", error); 
  } finally { 

    await client.close(); 

  } 

} 

 

// Διαδρομή για την εμφάνιση του χάρτη 

app.get('/', (req, res) => { 

  res.sendFile(path.join(__dirname, 'public', 'app.html')); 

}); 

 

// Διαδρομή για την επιστροφή των polygons 

app.get('/polygons', async (req, res) => { 

  const client = new MongoDBClient(uri); 

  try { 

    await client.connect(); 

    const database = client.db("ptuxiakh"); 

    const collection = database.collection("Regions"); 

 

    // Ανάκτηση των πολυγώνων από τη βάση 

    const polygons = await collection.find({}).toArray(); 

    res.json(polygons); 

  } catch (error) { 

    console.error("Error fetching polygons:", error); 

    res.status(500).send("Error fetching polygons"); 

  } finally { 

    await client.close(); 

  } 

}); 

 

// Διαδρομή για την επιστροφή των trips 

app.get('/trips', async (req, res) => { 

  const client = new MongoDBClient(uri); 

  try { 

    await client.connect(); 

    const database = client.db("ptuxiakh"); 

    const collection = database.collection("Trips"); 

 

    // Ανάκτηση των trips από τη βάση 

    const trips = await collection.find({}).toArray(); 

    res.json(trips); 

  } catch (error) { 

    console.error("Error fetching trips:", error); 

    res.status(500).send("Error fetching trips"); 

  } finally { 

    await client.close(); 

  } 

}); 

 

// Εκκίνηση του server 

app.listen(PORT, async () => { 

  console.log(`Server running at http://localhost:${PORT}`); 

  await insertPolygons(); // Εισαγωγή πολυγώνων κατά την εκκίνηση 

  await insertTrips(); // Εισαγωγή trips κατά την εκκίνηση 

}); 
