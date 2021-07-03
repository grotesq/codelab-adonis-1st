import {rules, schema} from "@ioc:Adonis/Core/Validator";

const SignUpSchema = schema.create({
  email: schema.string({
    trim: true,
  }, [
    rules.email(),
    rules.unique({table: 'users',column:'email'})
  ]),
  password: schema.string({},[
    rules.minLength(8)
  ])
})

export default SignUpSchema;
