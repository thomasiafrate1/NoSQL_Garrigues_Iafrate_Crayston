db = db.getSiblingDB("testdb");

db.createUser({
  user: "testuser",
  pwd: "testpass",
  roles: [{ role: "readWrite", db: "testdb" }]
});

db.testcollection.insertMany([
  { name: "Hugo", age: 30 },
  { name: "Matt", age: 25 },
  { name: "Thomas", age: 75 }
]);
