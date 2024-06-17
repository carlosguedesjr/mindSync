import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

import {
  StoreValidation,
  UpdateValidation,
  DeleteValidation
} from '../validations/user.validation';
import AuthError from '../../exceptions/authentication-error';
import ValidationError from '../../exceptions/validation-error';

import { User } from '../../models/user';
import UserRepository from '../../repositories/user.repository';

const fireAuth = admin.auth();

class UserController {
  async index(request: Request, response: Response) {
    const PER_PAGE = 10;

    const { page } = request.query;

    const { pagination, users } = await UserRepository.paginate(
      Number(page) || 1,
      PER_PAGE
    );

    return response.json({
      users,
      pagination,
      success: true,
    });
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const user = await UserRepository.getById(id);

    return response.json({
      success: true,
      user
    });
  }

  async store(request: Request, response: Response) {
    const body = request.body;

    await StoreValidation.validate(body).catch(err => {
      throw new ValidationError(err.errors[0]);
    });

    const user = new User();
    user.name = body.name;
    user.phone = body.phone;
    user.email = body.email;
    user.authType = body.authType;
    user.authRole = body.authRole;
    
    if (body.image) user.image = body.image;

    const data: admin.auth.CreateRequest = {
      email: user.email,
      displayName: user.name,
      password: body.password
    }
    
    if (user.phone) data.phoneNumber = `+55${user.phone}`;

    return await fireAuth.createUser(data).then(async userRecord => {
      const uid = userRecord.uid;
      user.id = uid;
      
      await fireAuth.setCustomUserClaims(uid, {role: user.authRole});
      await UserRepository.set(user);
  
      return response.json({
        success: true,
        user: {id: uid}
      });
    }).catch(err => {
      throw new AuthError(err.message, err.code);
    });
  }

  async update(request: Request, response: Response) {
    const body = request.body;
    const { id } = request.params;

    await UpdateValidation.validate({ ...body, id }).catch(err => {
      throw new ValidationError(err.errors[0]);
    });

    const user = await UserRepository.getById(id);

    if (body.authRole && body.authRole !== user.authRole) await fireAuth.setCustomUserClaims(id, {role: body.authRole});
    if (user.name !== body.name || user.email !== body.email || user.phone !== body.phone) {
      const data: admin.auth.UpdateRequest = {};

      if (body.name && user.name !== body.name) {
        data.displayName = body.name;
      } if (body.email && user.email !== body.email) {
        data.email = body.email;
      } if (body.phone && user.phone !== body.phone) {
        data.phoneNumber = `+55${body.phone}`;
      }

      if (Object.keys(data).length) {
        await fireAuth.updateUser(id, data).catch(err => {
          throw new AuthError(err.message, err.code);
        });
      }
    }

    if (body.name) user.name = body.name;
    if (body.image) user.image = body.image;
    if (body.phone) user.phone = body.phone;
    if (body.email) user.email = body.email;
    if (body.authType) user.authType = body.authType;
    if (body.authRole) user.authRole = body.authRole;

    await UserRepository.update(id, user);

    return response.json({
      success: true
    });
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;
    
    await DeleteValidation.validate({ id }).catch(err => {
      throw new ValidationError(err.errors[0]);
    });

    await UserRepository.delete(id);

    return response.json({
      success: true
    });
  }
}

export default new UserController();
