export enum ActivityType {
    AB,
    XT
}

export enum ActivityStatus {
    INACTIVE,
    ACTIVE,
    PAUSED
}

export interface ActivityJson {
    displayName: string;
    description?: string;
    type: ActivityType;
    status?: ActivityStatus;
}

export class Activity {

    private readonly displayName: string;

    private readonly description: string;

    private readonly type: ActivityType;

    private readonly status: ActivityStatus;

    constructor(builder: ActivityBuilder) {
        this.displayName = builder.displayName;
        this.description = builder.description || '';
        this.type = builder.type;
        this.status = builder.status;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    getDescription(): string {
        return this.description;
    }

    getType(): ActivityType {
        return this.type;
    }

    getStatus(): ActivityStatus {
        return this.status;
    }

}

export class ActivityBuilder {

    displayName: string;

    description: string;

    type: ActivityType;

    status: ActivityStatus;

    constructor(source?: Activity) {
        if (source) {
            this.displayName = source.getDisplayName();
            this.description = source.getDescription();
            this.type = source.getType();
            this.status = source.getStatus();
        }
    }

    fromJson(json: ActivityJson): ActivityBuilder {
        this.displayName = json.displayName;
        this.description = json.description || '';
        this.type = json.type;
        this.status = json.status || ActivityStatus.INACTIVE;
        return this;
    }

    setDisplayName(displayName: string): ActivityBuilder {
        this.displayName = displayName;
        return this;
    }

    setDescription(description: string): ActivityBuilder {
        this.description = description;
        return this;
    }

    build(): Activity {
        return new Activity(this);
    }
}
