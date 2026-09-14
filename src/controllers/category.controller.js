import crypto from 'crypto';
import { pool } from '../db/connection.js';
import { categoryDecorator, categoriesListDecorator } from '../decorators/category.decorator.js';
import { isValidId } from '../utils/validators.js';

export const index = async (req, res) => {
  try {
    const userId = req.user.user ? req.user.user.id : req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json({
      categories: categoriesListDecorator(rows)
    });
  } catch (error) {
    console.error('Error al listar categorías:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const store = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.user ? req.user.user.id : req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'El campo name es requerido' });
    }

    const id = crypto.randomUUID();

    await pool.query(
      'INSERT INTO categories (id, name, user_id) VALUES (?, ?, ?)',
      [id, name, userId]
    );

    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);

    return res.status(201).json({
      category: categoryDecorator(rows[0])
    });
  } catch (error) {
    console.error('Error al crear categoría:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user ? req.user.user.id : req.user.id;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Identificador de categoría no válido' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    return res.status(200).json({
      category: categoryDecorator(rows[0])
    });
  } catch (error) {
    console.error('Error al buscar categoría:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.user ? req.user.user.id : req.user.id;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Identificador de categoría no válido' });
    }

    if (!name) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await pool.query(
      'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
      [name, id, userId]
    );

    const [updatedRows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);

    return res.status(200).json({
      category: categoryDecorator(updatedRows[0])
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user ? req.user.user.id : req.user.id;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Identificador de categoría no válido' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return res.status(200).json({
      message: 'Categoría eliminada'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};