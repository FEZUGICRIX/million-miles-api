import { ConfigModuleOptions } from '@nestjs/config'

export const appConfig: ConfigModuleOptions = {
	isGlobal: true,
	ignoreEnvFile: false,
	envFilePath: '.env',
}
