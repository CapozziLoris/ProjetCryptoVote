// Title : Index.ts
// Description : Server module for voting system
// Author: Loris Capozzi
// Version 0.1

// Import des dépendances requises
import { PrismaClient } from "@prisma/client";
import express, { Application, Request, Response, NextFunction } from "express";
import session from 'express-session';
import { existsSync, mkdirSync, writeFileSync, createWriteStream } from "fs";
import dotenv from "dotenv";
//import cookie from "cookie-parser";
import morgan from "morgan";
import path from "path";


//import authRoutes from './routes/routes';

// Chemin de destination du fichier de Logs
const logDirectory = path.join(__dirname, "..", "logs");
const logFilePath = path.join(logDirectory, "server.log");

// Vérifie si le répertoire de logs existe, sinon le créer
if (!existsSync(logDirectory)) {
  mkdirSync(logDirectory);
}
// Vérifie si le fichier de logs existe, sinon le créer
if (!existsSync(logFilePath)) {
  writeFileSync(logFilePath, "");
}
// Flux d'écriture pour le fichier de logs
const logStream = createWriteStream(logFilePath, { flags: "a" });

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Déclaration de constantes pour ExpressJS
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || "localhost";
const app: Application = express();

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'MangeMonCookie',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // Mettre à true en production avec HTTPS
}));

// Middleware express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gestion des cookies par cookie-parser
// app.use(cookie());

// Affichage et sauvegarde des logs dans la console et dans un fichier texte
app.use(morgan("combined", { stream: logStream }));
app.use(morgan("combined"));

// Texte descriptif de l'API à sa racine
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    author: "Loris Capozzi",
    version: "0.1",
    description: "Server Module API for Voting System project",
    message: "Welcome to the root of the project",
  });
});

// Middleware pour authentifier l'utilisateur
//app.use(authenticateUser);

// Défini le fichier de routes
//app.use("/api", authRoutes);

// Gestion des erreurs ExpressJS
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error on express server" });;
});

// Le serveur écoute sur l'IP et le port défini
app.listen(PORT, HOST, () => {
  console.log(`Server listenning on ${HOST}:${PORT}`);
});

// Export de prisma pour la gestion de base de données
export const prisma = new PrismaClient();