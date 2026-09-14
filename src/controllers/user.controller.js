import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/connection.js';
import { userDecorator } from '../decorators/user.decorator.js';
import { isValidEmail } from '../utils/validators.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Los campos son obligatorios'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'El correo electrónico no tiene un formato válido'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'La contraseña debe tener como mínimo 8 caracteres'
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT * FROM user WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(422).json({
        message: 'El correo electrónico ya está registrado'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const [newUserRows] = await pool.query(
      'SELECT * FROM user WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userDecorator(newUserRows[0])
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'El correo electrónico y la contraseña son requeridos'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'El correo electrónico no tiene un formato válido'
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM user WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      { user: userDecorator(user) },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: userDecorator(user)
    });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};