import { defineField, defineType } from 'sanity'

// Alt text on every image. The publish pipeline has always written `alt`
// onto the image objects and the templates have always read it; declaring
// it here makes it visible and editable in Studio instead of a hidden key.
const altField = defineField({
  name: 'alt',
  title: 'Alt text',
  type: 'string',
  description:
    'Describe what the image shows, for screen readers and AI crawlers. Not a caption.',
  validation: (Rule) => Rule.max(160),
})

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The essay headline. Max 100 characters for SEO.',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [altField],
    }),
    defineField({
      name: 'midImage',
      title: 'Mid Image',
      type: 'image',
      options: { hotspot: true },
      fields: [altField],
    }),
    defineField({
      name: 'socialImage',
      title: 'Social Image',
      type: 'image',
      options: { hotspot: true },
      fields: [altField],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', fields: [altField] }],
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description:
        'One-sentence summary for search results and social cards. 150-160 characters is ideal.',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'primaryKeyword',
      title: 'Primary Keyword',
      type: 'string',
      description:
        'The one SEO keyword this post targets. Pulled from seo-keywords.md. Max 60 characters.',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'articleSection',
      title: 'Article Section',
      type: 'string',
      description:
        'Short category label shown above the post title. 2-4 words max. Examples: The Operator Trap, The Content Ecosystem, AI Agents, The Old Mindset.',
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: 'faqItems',
      title: 'FAQ Items',
      type: 'array',
      description: 'Questions this post answers. Rendered as FAQ schema for AI answer engines.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required().max(150),
            },
            {
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required().max(600),
            },
          ],
          preview: {
            select: { title: 'question' },
          },
        },
      ],
    }),
    defineField({
      name: 'complianceApproved',
      title: 'Compliance Approved',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      initialValue: 'Adam Sowden',
    }),
  ],
})
