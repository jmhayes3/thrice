DROP TABLE IF EXISTS Customers;
CREATE TABLE IF NOT EXISTS Customers (CustomerId INTEGER PRIMARY KEY, CompanyName TEXT, ContactName TEXT);
INSERT INTO Customers (CustomerID, CompanyName, ContactName) VALUES (1, 'Alfreds Futterkiste', 'Maria Anders'), (4, 'Around the Horn', 'Thomas Hardy'), (11, 'Bs Beverages', 'Victoria Ashworth'), (13, 'Bs Beverages', 'Random Name');

DROP TABLE IF EXISTS sensor_readings;
CREATE TABLE sensor_readings (
    event_id INTEGER PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    raw_data TEXT,
    location as (json_extract(raw_data, '$.measurement.location')) STORED
);
INSERT INTO sensor_readings (event_id, timestamp, raw_data) VALUES (1, 112312332123, '{
    "measurement": {
        "temp_f": "77.4",
        "aqi": [21, 42, 58],
        "o3": [18, 500],
        "wind_mph": "13",
        "location": "US-NY"
    }
}');
