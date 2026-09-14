import crypto from "crypto";
import { pool } from "../db/connection.js";
import {
  tagDecorator,
  tagsListDecorator,
} from "../decorators/tag.decorator.js";
import { isValidId } from "../utils/validators.js";

export const index = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tags ORDER BY created_at DESC"
    );
    return res.status(200).json({
      tags: tagsListDecorator(rows),
    });
  } catch (error) {
    console.error("Error al obtener etiquetas:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor" });
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
    });
  } catch (error) {
    console.error("Error al crear etiqueta:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor" });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ message: "Identificador de etiqueta no válido" });
    }

    const [rows] = await pool.query("SELECT * FROM tags WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Etiqueta no encontrada" });
    }

    return res.status(200).json({
      tag: tagDecorator(rows[0]),
    });
  } catch (error) {
    console.error("Error al buscar etiqueta:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor" });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ message: "Identificador de etiqueta no válido" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ message: "El nombre es obligatorio" });
    }

    const [existing] = await pool.query("SELECT * FROM tags WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ message: "Etiqueta no encontrada" });
    }

    await pool.query("UPDATE tags SET name = ? WHERE id = ?", [name, id]);

    const [updatedRows] = await pool.query("SELECT * FROM tags WHERE id = ?", [
      id,
    ]);

    return res.status(200).json({
      message: "Etiqueta actualizada",
      tag: tagDecorator(updatedRows[0]),
    });
  } catch (error) {
    console.error("Error al actualizar etiqueta:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor" });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ message: "Identificador de etiqueta no válido" });
    }

    const [existing] = await pool.query("SELECT * FROM tags WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ message: "Etiqueta no encontrada" });
    }

    await pool.query("DELETE FROM tags WHERE id = ?", [id]);

    return res.status(200).json({
      message: "Etiqueta eliminada",
    });
  } catch (error) {
    console.error("Error al eliminar etiqueta:", error.message);
    return res
      .status(500)
      .json({ message: "Error interno del servidor" });
  }
};