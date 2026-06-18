import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/spoton_challenge',
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}