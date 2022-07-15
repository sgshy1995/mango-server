import {Module} from '@nestjs/common';

import {AssistantController} from './assistant.controller';
import {AssistantService} from './assistant.service';

@Module({
    imports: [],
    controllers: [AssistantController],
    providers: [AssistantService],
    exports: [AssistantService]
})
export class AssistantModule {
}
