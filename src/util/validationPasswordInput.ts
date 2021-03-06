import {CodeError} from '../types/codeError';
import {ChangePasswordAfterLoginInputType} from '../types/changePasswordInputType';
import bcrypt from 'bcrypt';
import { minPasswordLength } from '../constraint';
export const ValidationChangePasswordInput = async (
	ChangePasswordInput: ChangePasswordAfterLoginInputType,
	oldPasswordInDatabase: string,
) => {
	if (ChangePasswordInput.oldPassword.length < minPasswordLength) {
		return {
			success: false,
			message: 'Old password is not valid',
			code: CodeError.old_password_not_valid,
			error: [
				{
					field: 'oldPassword',
					message: 'Old password is not valid',
				},
			],
		};
	} else if (ChangePasswordInput.newPassword.length < minPasswordLength) {
		return {
			success: false,
			message: 'New password is not valid',
			code: CodeError.new_password_not_valid,
			error: [
				{
					field: 'newPassword',
					message: 'New password is not valid',
				},
			],
		};
	}
	const passwordIsValid = await bcrypt.compare(
		ChangePasswordInput.oldPassword,
		oldPasswordInDatabase,
	);
	if (!passwordIsValid) {
		return {
			success: false,
			message: 'Old password is not valid',
			code: CodeError.old_password_not_valid,
			error: [
				{
					field: 'oldPassword',
					message: 'Old password is not valid',
				},
			],
		};
	}
	return false;
};
