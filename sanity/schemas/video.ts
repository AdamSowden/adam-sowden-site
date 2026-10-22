import { defineField, defineType } from 'sanity'

// One entry per video. Wistia holds the file, captions and analytics; this
// document holds everything the site needs to show it well: who is speaking,
// the words, and the fields that feed VideoObject structured data. A video
// is never pasted into a page as embed code; pages reference this document.
//
// Testimonials must carry what the Smart Site Diagnostic's own trust check
// (tr-01) looks for: first name, role, business or location, and a specific
// result. Anything weaker is formatted as a result statement, not a quote.

const WISTIA_ID = /^[a-z0-9]{10}$/

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description:
        'Shown to screen readers and search engines, not on the page. Say what the video is: "Sarah on moving her clinic to a Smart Site".',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'wistiaId',
      title: 'Wistia media ID',
      type: 'string',
      description:
        'The ten-character id from the Wistia media URL, e.g. e4a27b971d. Set the media to not-public in Wistia so Google indexes this site, not Wistia.',
      validation: (Rule) =>
        Rule.required().custom((v) =>
          typeof v === 'string' && WISTIA_ID.test(v)
            ? true
            : 'Must be the ten lower-case letters and digits from the Wistia URL.'
        ),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Testimonial', value: 'testimonial' },
          { title: 'Explainer', value: 'explainer' },
          { title: 'Walkthrough', value: 'walkthrough' },
        ],
        layout: 'radio',
      },
      initialValue: 'testimonial',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'orientation',
      title: 'Orientation',
      type: 'string',
      options: {
        list: [
          { title: 'Landscape (16:9)', value: 'landscape' },
          { title: 'Portrait (9:16, phone video)', value: 'portrait' },
        ],
        layout: 'radio',
      },
      initialValue: 'landscape',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences on what the video covers. Feeds structured data; not shown on the page.',
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'uploadDate',
      title: 'Recorded or published on',
      type: 'date',
    }),
    defineField({
      name: 'poster',
      title: 'Poster frame',
      type: 'image',
      description:
        'Optional. A frame you chose, with the person looking at camera. If empty, the site uses the Wistia thumbnail.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.max(160),
        }),
      ],
    }),
    defineField({
      name: 'person',
      title: 'Who is speaking',
      type: 'object',
      description: 'Required for testimonials.',
      fields: [
        defineField({ name: 'firstName', title: 'First name', type: 'string' }),
        defineField({ name: 'role', title: 'Role', type: 'string' }),
        defineField({
          name: 'business',
          title: 'Business or category',
          type: 'string',
          description: 'The business name, or the category if the name cannot be used.',
        }),
        defineField({ name: 'location', title: 'Location', type: 'string' }),
      ],
    }),
    defineField({
      name: 'pullQuote',
      title: 'Pull quote',
      type: 'text',
      rows: 3,
      description: 'One sentence from the video, in their words. Shown beside the player.',
      validation: (Rule) => Rule.max(220),
    }),
    defineField({
      name: 'result',
      title: 'The specific result',
      type: 'text',
      rows: 2,
      description:
        'One sentence with the number, timeframe or change. Required for testimonials.',
      validation: (Rule) => Rule.max(220),
    }),
    defineField({
      name: 'transcript',
      title: 'Transcript',
      type: 'text',
      rows: 16,
      description:
        'Paste from Wistia after reviewing the captions. Blank line between paragraphs. Shown on the page under "Read the transcript" and sent to search engines.',
    }),
    defineField({
      name: 'featuredOnHome',
      title: 'Feature on the home page',
      type: 'boolean',
      description:
        'Testimonials only. The most recently updated featured testimonial shows in the Results section.',
      initialValue: false,
    }),
  ],
  validation: (Rule) =>
    Rule.custom((doc) => {
      const d = doc as
        | {
            kind?: string
            person?: { firstName?: string; role?: string; business?: string; location?: string }
            result?: string
          }
        | undefined
      if (!d || d.kind !== 'testimonial') return true
      const p = d.person ?? {}
      const missing: string[] = []
      if (!p.firstName) missing.push('first name')
      if (!p.role) missing.push('role')
      if (!p.business && !p.location) missing.push('business or location')
      if (!d.result) missing.push('the specific result')
      return missing.length
        ? `A testimonial needs ${missing.join(', ')}.`
        : true
    }),
  preview: {
    select: { title: 'title', kind: 'kind', name: 'person.firstName', media: 'poster' },
    prepare({ title, kind, name, media }) {
      return {
        title,
        subtitle: [kind, name].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})

// Block type for blog bodies: a reference to a video plus an optional
// visible caption. Rendered by the blog page as the same click-to-play
// player the home page uses.
export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'video',
      title: 'Video',
      type: 'reference',
      to: [{ type: 'video' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: { title: 'video.title', subtitle: 'caption', media: 'video.poster' },
  },
})
