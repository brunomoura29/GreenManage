export interface Local {
    id: string
    company: string | null
    name: string | null
    photos: string | null
    creation_date: string | null
    modified_date: string | null
    creator: string | null
    unique_id: string | null
    user_id: string | null
}

export type LocalInsert = Omit<Local, 'id' | 'creation_date' | 'modified_date'>
export type LocalUpdate = Partial<LocalInsert>
