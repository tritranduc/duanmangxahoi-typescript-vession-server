import { Field, InputType } from "type-graphql";

@InputType()
export class resisterInput {
    @Field()
    username: string
    @Field()
    email: string
    @Field()
    password :string
}