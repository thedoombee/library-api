import {z} from zod ;

const createAuthorSchema = z.object({
    body: z.object({
        name: z.string().min(3,"At least 3 caraters are required").max(200),
        bio: z.string().max(2000).optional(),
    }).strict(),
});

const updateAuthorSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    })
    body: z.object({
        name: z.string().min(3).max(200).optinal(),
        bio: z.string().max(2000).optinal()
    }).strict(),
})

