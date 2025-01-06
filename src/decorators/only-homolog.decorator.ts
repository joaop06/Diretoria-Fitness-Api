import { SetMetadata } from '@nestjs/common';

export const ONLY_HOMOLOG_KEY = 'onlyHomolog';
export const OnlyHomolog = () => SetMetadata(ONLY_HOMOLOG_KEY, true);
