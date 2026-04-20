import { Request, Response } from 'express';
import { cityRepository } from '../repositories/cityRepository';

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await cityRepository.findAll();
    res.json(cities.map(c => ({ cityId: c.city_id, name: c.name })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};