const fs = require("fs");

const cors = require("cors");

const express = require("express");

const crypto = require("crypto");

const file = "./data.json";

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

class Product {
  public id: string;
  public name: string;
  public price: number;
  public stock: number;

  constructor(id: string, name: string, price: number, stock: number = 0) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
  }
}

class ProductManager {
  public products: Product[] = [];

  constructor() {
    this.load();
  }

  public addProduct(name: string, price: number, stock: number = 0) {
    const id = crypto.randomBytes(16).toString("hex");
    const product = new Product(id, name, price, stock);
    this.products.push(product);
    this.save();
  }

  public removeProduct(id: string) {
    this.products = this.products.filter((product) => product.id !== id);
    this.save();
  }

  public updateProduct(id: string, name: string, price: number, stock: number) {
    const product = this.products.find((product) => product.id === id);
    if (product) {
      product.name = name;
      product.price = price;
      product.stock = stock;
      this.save();
    }
  }

  public listProducts() {
    return this.products;
  }

  private load() {
    try {
      const data = fs.readFileSync(file, "utf-8");
      this.products = JSON.parse(data);
    } catch (error) {
      console.log("Error loading data", error);
    }
  }

  private save() {
    try {
      fs.writeFileSync(file, JSON.stringify(this.products, null, 2));
    } catch (error) {
      console.log("Error saving data", error);
    }
  }
}

const manager = new ProductManager();

app.get("/products", (req: any, res: any) => {
  res.json(manager.listProducts());
});

app.post("/products", (req: any, res: any) => {
  const { name, price, stock } = req.body;
  manager.addProduct(name, price, stock);
  res.json(manager.listProducts());
});

app.delete("/products/:id", (req: any, res: any) => {
  const { id } = req.params;
  manager.removeProduct(id);
  res.json(manager.listProducts());
});

app.put("/products/:id", (req: any, res: any) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;
  manager.updateProduct(id, name, price, stock);
  res.json(manager.listProducts());
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
