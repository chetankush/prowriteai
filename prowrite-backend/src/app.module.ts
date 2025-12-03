import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth';
import { TemplatesModule } from './modules/templates';
import { GenerationModule } from './modules/generation';
import { WorkspaceModule } from './modules/workspace';
import { ChatModule } from './modules/chat';
import { BillingModule } from './modules/billing';
import { TeamModule } from './modules/team';
import { IncidentModule } from './modules/incident';
import { TranslateModule } from './modules/translate';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    TemplatesModule,
    GenerationModule,
    WorkspaceModule,
    ChatModule,
    BillingModule,
    TeamModule,
    IncidentModule,
    TranslateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
