import { RemoteMongoClient } from "mongodb-stitch-browser-sdk";
import { stitchApp } from "./stitchapp";


// Initialize a MongoDB Service Client
const mongoClient = stitchApp.getServiceClient(
  RemoteMongoClient.factory,
  "todo-cluster"
);

// Instantiate collection handles
const categories = mongoClient.db("todo_application").collection("categories");
const todos = mongoClient.db("todo_application").collection("todos");
const users = mongoClient.db("todo_application").collection("users");

export { categories, todos, users };
