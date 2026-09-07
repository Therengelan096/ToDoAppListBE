import bcrypt from 'bcrypt';
import { pool } from '../db/connection.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Los campos son obligatorios'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'La contraseña debe tener como mínimo 8 caracteres'
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM user WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(422).json({
        error: 'El correo electrónico ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};