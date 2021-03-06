import {Field, ObjectType} from 'type-graphql'
import {IMutationResponse} from './BaseResponseType'
import {FieldError} from './errorField'
import Post from '../model/post'

@ObjectType({implements: IMutationResponse})
export class getPostByIdResponse implements IMutationResponse {
	code: number
	success: boolean
	message?: string
	@Field(() => [FieldError], {nullable: true})
	errors?: FieldError[]
	@Field(() => Post, {nullable: true})
	post?: Post
}
