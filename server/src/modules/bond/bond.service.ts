import { Injectable, BadRequestException } from '@nestjs/common';
import { runBondCalculation } from './bond-calculations.js';
import type { CalculateBondDto } from './dto/calculate-bond.dto.js';

@Injectable()
export class BondService {
  calculate(dto: CalculateBondDto) {
    if (dto.faceValue <= 0 || dto.marketPrice <= 0 || dto.yearsToMaturity <= 0) {
      throw new BadRequestException(
        'faceValue, marketPrice and yearsToMaturity must be greater than 0',
      );
    }
    if (dto.annualCouponRate < 0) {
      throw new BadRequestException('annualCouponRate must be >= 0');
    }
    if (dto.couponFrequency !== 1 && dto.couponFrequency !== 2) {
      throw new BadRequestException('couponFrequency must be 1 (annual) or 2 (semi-annual)');
    }
    return runBondCalculation({
      faceValue: dto.faceValue,
      annualCouponRate: dto.annualCouponRate,
      marketPrice: dto.marketPrice,
      yearsToMaturity: dto.yearsToMaturity,
      couponFrequency: dto.couponFrequency,
    });
  }
}
