export class AuthResponseDto {
  access_token!: string;
  workspace_id!: string;
  email!: string;
}

export class UserInfoDto {
  id!: string;
  email!: string;
  workspace_id!: string;
  workspace_name!: string;
}
