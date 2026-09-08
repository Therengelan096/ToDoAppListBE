import crypto from "crypto";
import { pool } from "../db/connection.js";
import {
  tagDecorator,
  tagsListDecorator,
} from "../decorators/tag.decorator.js";

const isValidId = (id) => typeof id === "string" && id.trim().length === 36;

export const index = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tags ORDER BY created_at DESC",
    );
    return res.status(200).json({
      tags: tagsListDecorator(rows),
      status: 200,
    });
  } catch (error) {
    console.error("Error al obtener etiquetas:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", status: 500 });
  }
};

export const store = async (req, res) => {
  try {
    const { name, user_id } = req.body;

    if (!name || !user_id) {
      return res
        .status(400)
        .json({
          message: "Los campos name y user_id son requeridos",
          status: 400,
        });
    }

    const id = crypto.randomUUID();

    await pool.query("INSERT INTO tags (id, name, user_id) VALUES (?, ?, ?)", [
      id,
      name,
      user_id,
    ]);

    const [rows] = await pool.query("SELECT * FROM tags WHERE id = ?", [id]);

    return res.status(201).json({
      message: "Etiqueta creada",
      tag: tagDecorator(rows[0]),
      status: 201,
    });
  } catch (error) {
    console.error("Error al crear etiqueta:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", status: 500 });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ message: "Identificador de etiqueta no válido", status: 400 });
    }

    const [rows] = await pool.query("SELECT * FROM tags WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Etiqueta no encontrada", status: 404 });
    }

    return res.status(200).json({
      tag: tagDecorator(rows[0]),
      status: 200,
    });
  } catch (error) {
    console.error("Error al buscar etiqueta:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", status: 500 });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ message: "Identificador de etiqueta no válido", status: 400 });
    }

    if (!name) {
      return res
        .status(400)
        .json({ message: "El nombre es obligatorio", status: 400 });
    }

    const [existing] = await pool.query("SELECT * FROM tags WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ message: "Etiqueta no encontrada", status: 404 });
    }

    await pool.query("UPDATE tags SET name = ? WHERE id = ?", [name, id]);

    const [updatedRows] = await pool.query("SELECT * FROM tags WHERE id = ?", [
      id,
    ]);

    return res.status(200).json({
      message: "Etiqueta actualizada",
      tag: tagDecorator(updatedRows[0]),
      status: 200,
    });
  } catch (error) {
    console.error("Error al actualizar etiqueta:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", status: 500 });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ message: "Identificador de etiqueta no válido", status: 400 });
    }

    const [existing] = await pool.query("SELECT * FROM tags WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ message: "Etiqueta no encontrada", status: 404 });
    }

    await pool.query("DELETE FROM tags WHERE id = ?", [id]);

    return res.status(200).json({
      message: "Etiqueta eliminada",
      status: 200,
    });
  } catch (error) {
    console.error("Error al eliminar etiqueta:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", status: 500 });
  }
};
