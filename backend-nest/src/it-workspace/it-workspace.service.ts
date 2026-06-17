import { Injectable } from '@nestjs/common';

@Injectable()
export class ItWorkspaceService {
  summary() {
    return {
      message: 'Starter workspace only. Implement IT Work Items, QA Checks, and Release Notes.',
      counts: {
        workItems: 0,
        qaChecks: 0,
        releases: 0,
      },
    };
  }

  listWorkItems() {
    return [];
  }
}
