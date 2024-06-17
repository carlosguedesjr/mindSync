import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

import {
  StoreValidation,
  UpdateValidation,
  DeleteValidation
} from '../validations/student.validation';
import AuthError from '../../exceptions/authentication-error';
import ValidationError from '../../exceptions/validation-error';

import { Student } from '../../models/student';
import StudentRepository from '../../repositories/student.repository';
import CompanyRepository from '../../repositories/company/company.repository';
import CompanyAreaRepository from '../../repositories/company/area.repository';
import CompanyPostRepository from '../../repositories/company/post.repository';
import CompanyBranchRepository from '../../repositories/company/branch.repository';
import CompanyDepartmentRepository from '../../repositories/company/department.repository';

const fireAuth = admin.auth();

class StudentController {

  async all(request: Request, response: Response) {
    const students = await StudentRepository.getAll();

    for (const student of students) {
      if (student.company) {
        if (student.company.areaId) student.company._area = await CompanyAreaRepository.getById(student.company.areaId);
        if (student.company.postId) student.company._post = await CompanyPostRepository.getById(student.company.postId);
        if (student.company.branchId) student.company._branch = await CompanyBranchRepository.getById(student.company.branchId);
        if (student.company.companyId) student.company._company = await CompanyRepository.getById(student.company.companyId);
        if (student.company.departmentId) student.company._department = await CompanyDepartmentRepository.getById(student.company.departmentId);
      }
    }

    students.sort((a, b) => a.name.localeCompare(b.name));

    return response.json({
      success: true,
      students
    })
  }
  
  async store(request: Request, response: Response) {
    const body = request.body;

    await StoreValidation.validate(body).catch(err => {
      throw new ValidationError(err.errors[0]);
    });

    const student = new Student();
    student.name = body.name;
    student.email = body.email;
    student.authType = body.authType;
    
    if (body.rg) student.rg = body.rg;
    if (body.cpf) student.cpf = body.cpf;
    if (body.phone) student.phone = body.phone;
    if (body.image) student.image = body.image;
    if (body.token) student.token = body.token;
    if (body.genre) student.genre = body.genre;
    if (body.social) student.social = body.social;
    if (body.course) student.course = body.course;
    if (body.address) student.address = body.address;
    if (body.company) student.company = body.company;
    if (body.childrens) student.childrens = body.childrens;
    if (body.cityBirth) student.cityBirth = body.cityBirth;
    if (body.rgEmitter) student.rgEmitter = body.rgEmitter;
    if (body.stateBirth) student.stateBirth = body.stateBirth;
    if (body.scholarity) student.scholarity = body.scholarity;
    if (body.motherName) student.motherName = body.motherName;
    if (body.spouseName) student.spouseName = body.spouseName;
    if (body.civilStatus) student.civilStatus = body.civilStatus;
    if (body.dateBirth) student.dateBirth = new Date(body.dateBirth);

    const data: admin.auth.CreateRequest = {
      email: student.email,
      displayName: student.name,
      password: body.password
    }

    return await fireAuth.createUser(data).then(async userRecord => {
      const uid = student.id = userRecord.uid;
      await StudentRepository.set(student);

      return response.json({
        success: true,
        student: {id: uid}
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

    const student = await StudentRepository.getById(id);

    if (student.name !== body.name || student.email !== body.email) {
      const data: admin.auth.UpdateRequest = {};

      if (body.name && student.name !== body.name) {
        data.displayName = body.name;
      } if (body.email && student.email !== body.email) {
        data.email = body.email;
      }

      if (Object.keys(data).length) {
        await fireAuth.updateUser(id, data).catch(err => {
          throw new AuthError(err.message, err.code);
        });
      }
    }

    if (body.name) student.name = body.name;
    if (body.image) student.image = body.image;
    if (body.phone) student.phone = body.phone;
    if (body.email) student.email = body.email;

    if (body.rg) student.rg = body.rg;
    if (body.cpf) student.cpf = body.cpf;
    if (body.phone) student.phone = body.phone;
    if (body.image) student.image = body.image;
    if (body.token) student.token = body.token;
    if (body.genre) student.genre = body.genre;
    if (body.social) student.social = body.social;
    if (body.course) student.course = body.course;
    if (body.address) student.address = body.address;
    if (body.company) student.company = body.company;
    if (body.cityBirth) student.cityBirth = body.cityBirth;
    if (body.rgEmitter) student.rgEmitter = body.rgEmitter;
    if (body.stateBirth) student.stateBirth = body.stateBirth;
    if (body.scholarity) student.scholarity = body.scholarity;
    if (body.motherName) student.motherName = body.motherName;
    if (body.spouseName) student.spouseName = body.spouseName;
    if (body.civilStatus) student.civilStatus = body.civilStatus;
    if (body.dateBirth) student.dateBirth = new Date(body.dateBirth);
    if (body.childrens || body.childrens === 0) student.childrens = body.childrens;

    await StudentRepository.update(id, student);

    return response.json({
      success: true
    });
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;
    
    await DeleteValidation.validate({ id }).catch(err => {
      throw new ValidationError(err.errors[0]);
    });

    await StudentRepository.delete(id);

    return response.json({
      success: true
    });
  }
}

export default new StudentController();
