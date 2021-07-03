import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'

import Todo from "App/Models/Todo";
import Application from "@ioc:Adonis/Core/Application";

export default class TodosController {
  async create({request}:HttpContextContract) {
    // const key = request.input('key', 'default key' )
    // const second = request.input('second', 'default 2nd' );
    // const body = request.only([ 'key', 'second' ] )
    // if( body.key === undefined ) {
    //   body.key = 'default key';
    // }
    // return { key, second };
    // return body;
    return request.body()
    // const todo : Todo = new Todo()
    // todo.content = '할 일 내용';
    // return await todo.save();
    return await Todo.create({
      content: 'create() 명령으로 삽입한 데이터'
    })
  }

  async list({auth}:HttpContextContract) {
    if(auth.user) {
      return '개인화된 컨텐츠 목록';
    }
    return await Todo.all()
  }

  async read({params}: HttpContextContract) {
    const {id} = params;
    // const { id } = request.qs();
    return await Todo.findOrFail(id);
  }

  async update() {
    const todo: Todo = await Todo.findOrFail(1);
    todo.content = '데이터 수정';
    await todo.save();
    return todo;
  }

  async delete() {
    const todo: Todo = await Todo.findOrFail(1);
    await todo.delete();
    return 'ok';
  }

  async upload({request}:HttpContextContract) {
    const file = request.file('file')
    file?.move(Application.publicPath('uploads'), {
      name: '210703-uploaded'
    })
    return 'upload';
  }
}

/*
  API - http://localhost:3333
  Web - http://localhost:3000
  App - ?
  Postman - ?
 */
