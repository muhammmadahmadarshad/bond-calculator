import { Body, Controller, Post } from '@nestjs/common';
import { BondService } from './bond.service.js';
import { CalculateBondDto } from './dto/calculate-bond.dto.js';

@Controller('bond')
export class BondController {
  constructor(private readonly bondService: BondService) {}

  @Post('calculate')
  calculate(@Body() dto: CalculateBondDto) {
    return this.bondService.calculate(dto);
  }
}
