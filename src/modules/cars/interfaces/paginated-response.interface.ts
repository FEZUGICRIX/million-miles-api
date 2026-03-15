export interface PaginationMeta {
	total: number
	page: number
	lastPage: number
	hasNextPage: boolean
}

export interface PaginatedResponse<T> {
	data: T[]
	meta: PaginationMeta
}
