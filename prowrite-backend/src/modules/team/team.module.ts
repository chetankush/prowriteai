import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { AssetService } from './asset.service';
import { ApprovalService } from './approval.service';
import { PersonalizationService } from './personalization.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TeamController],
  providers: [
    TeamService,
    AssetService,
    ApprovalService,
    PersonalizationService,
  ],
  exports: [
    TeamService,
    AssetService,
    ApprovalService,
    PersonalizationService,
  ],
})
export class TeamModule {}
