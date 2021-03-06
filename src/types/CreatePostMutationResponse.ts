import {Field, ObjectType} from 'type-graphql'
import {IMutationResponse} from './BaseResponseType'
import {FieldError} from './errorField'
import Post from '../model/post'

@ObjectType({implements: IMutationResponse})
export class CreatePostMutationResponse implements IMutationResponse {
	code: number
	success: boolean
	message?: string
	@Field(() => [FieldError], {nullable: true})
	errors?: FieldError[]
	@Field(() => [Post], {
		nullable: true,
		description:
			'for create post or update or delete server return post info after create or update or delete',
	})
	posts?: Post[]
}
