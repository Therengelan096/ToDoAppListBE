import crypto from "crypto";
import { pool } from "../db/connection.js";
import {
  tagDecorator,
  tagsListDecorator,
} from "../decorators/tag.decorator.js";
import { isValidId } from "../utils/validators.js";

export const index = async (req, res) => {
  try {
    const userId = req.user.user ? req.user.user.id : req.user.id;

    const [rows] = await pool.query(
      "SELECT * FROM tags WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
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
    const { name } = req.body;
    const userId = req.user.user ? req.user.user.id : req.user.id;

    if (!name) {
      return res
        .status(400)
        .json({
          message: "El campo name es requerido",
        });
    }

    const id = crypto.randomUUID();

    await pool.query("INSERT INTO tags (id, name, user_id) VALUES (?, ?, ?)", [
      id,
      name,
      userId,
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
    const userId = req.user.user ? req.user.user.id : req.user.id;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ message: "Identificador de etiqueta no válido" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM tags WHERE id = ? AND user_id = ?",
      [id, userId]
    );

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
    const userId = req.user.user ? req.user.user.id : req.user.id;

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

    const [existing] = await pool.query(
      "SELECT * FROM tags WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ message: "Etiqueta no encontrada" });
    }

    await pool.query(
      "UPDATE tags SET name = ? WHERE id = ? AND user_id = ?",
      [name, id, userId]
    );

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
    const userId = req.user.user ? req.user.user.id : req.user.id;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ message: "Identificador de etiqueta no válido" });
    }

    const [existing] = await pool.query(
      "SELECT * FROM tags WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ message: "Etiqueta no encontrada" });
    }

    await pool.query("DELETE FROM tags WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

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