// Recursive command types (explicit "commands" bag for subcommands)
export type Command = {
    name: string;
    description: string;
    options?: Record<string, Option>;
    subcommands?: Record<string, Command>
};

export type Option = {
    description: string;
}

export type Reply = {
    content: string;
    [key: string]: Reply | string;
}

export type LocalizeConfig = {
    commands: Record<string, Command>;
    replies: Record<string, Reply>;
};
