import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class RequestParserPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return JSON.parse(value);
    } catch {
      throw new BadRequestException('JSON not properly formatted.');
    }
  }
}
