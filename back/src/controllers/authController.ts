import { z } from 'zod';
import { registerUser, loginUser } from '../services/userService';
import type { Request, Response } from 'express';


export const registrationSchema = z.object({
    name: z.string().min(1, 'Данное поле является обязательным для заполнения'),
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен состоять минимум из 6 символов'),
    cityId: z.number().int().positive('Выберите город'),
    birthday_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты ГГГГ-ММ-ДД'),
    description: z.string().optional()

});

export const loginSchema = z.object({

    email: z.string().email('Некорректный email'),
    password: z.string().min(1, 'Пароль обязателен')

})



export const registration = async (req: Request, res: Response): Promise<void> => {
    
    try{
        const parsed = registrationSchema.parse(req.body);
        const result = await registerUser(
            parsed.name,
            parsed.email,
            parsed.password,
            parsed.cityId,
            parsed.birthday_date,
            parsed.description
        );
        res.json(result);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
        } else if (error.message === 'User already exists') {
        res.status(409).json({ message: error.message });
        } else {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        }
    }

}

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = loginSchema.parse(req.body);
        const result = await loginUser(
            parsed.email,
            parsed.password
        );
        res.json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
        } else if (error instanceof Error && (error.message === 'User is not registered or email is wrong' || error.message === 'Invalid password')) {
            res.status(401).json({ message: error.message });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}