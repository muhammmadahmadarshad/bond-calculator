import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BondModule } from './modules/bond/bond.module.js';

@Module({
  imports: [BondModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
