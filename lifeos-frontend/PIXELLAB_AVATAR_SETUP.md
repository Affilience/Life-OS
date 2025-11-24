# PixelLab Avatar Integration

## Current Status

✅ **40 Avatar Stages Queued** - All evolution stages from "Ordinary Human" to "The Infinite" have been submitted to PixelLab
⏳ **Generation Pending** - Awaiting processing (hit daily credit limit on 2025-11-20)
📋 **Integration Ready** - Frontend code prepared to use PixelLab avatars once generated

## Avatar Stages in Queue

All 40 evolution stages are queued in PixelLab:

| Stage | Name | Character ID | Status |
|-------|------|--------------|--------|
| 1 | Ordinary Human | `c19a9f31-c7e0-481e-a9a5-04234e0f160f` | Pending |
| 2 | Trainee | `0db17f31-ca3f-4603-958e-5880a3ec5abe` | Pending |
| 3 | Recruit | `a30098da-609d-4506-81e7-495ecf929aa8` | Pending |
| 4 | Cadet | `c6548c30-1ca0-46a8-8159-39c40ef27da9` | Pending |
| 5 | Junior Astronaut | `bf5c72e5-34eb-42e7-a6b6-2228638421af` | Pending |
| 6 | Astronaut | `08a7432a-d5d1-4c2d-a5b3-c6e259785be6` | Pending |
| 7 | Elite Astronaut | `d8a8d2b3-0101-4975-9a3f-a78c797664c2` | Pending |
| 8 | Tech Specialist | `a0f57777-0ba6-4df7-95ea-33be7bb09e2e` | Pending |
| 9 | Augmented Explorer | `3b7c8afb-ddf2-4be2-8219-0df1caa6bbce` | Pending |
| 10 | Cybernetic Soldier | `b5aaf41e-318f-4298-b719-6affe8d0cb33` | Pending |
| ... | ... | ... | ... |
| 40 | The Infinite | `dbc4ac45-03a7-4a35-bfe5-f5052dbf6174` | Pending |

## Avatar Specifications

All avatars generated with:
- **Directions**: 4 (south, west, east, north)
- **Canvas Size**: 48×48px
- **Character Size**: ~28px tall, ~21px wide
- **View**: Low top-down perspective
- **Outline**: Single color black outline
- **Shading**: Basic to detailed (varies by stage)
- **Detail**: Medium to high (varies by stage)

## Integration Files Created

### 1. `/src/services/pixellab.js`
Contains:
- Stage descriptions for PixelLab generation
- Character creation parameters
- Animation template mappings
- Equipment generation configs

### 2. `/src/api/avatars.js`
React Query hooks for:
- `useUserAvatar()` - Get user's current avatar
- `useGenerateAvatar()` - Request avatar generation
- `useUpdateAvatarUrl()` - Update avatar after generation
- `useGenerateEquipment()` - Generate equipment overlays

### 3. `/scripts/download-avatars.js`
Node script to download all generated avatars from PixelLab once ready.

## Next Steps

### Once PixelLab Credits Refresh:

1. **Check Generation Status**:
   ```bash
   # Via MCP (in Claude Code)
   mcp__pixellab__list_characters()
   ```

2. **Download Avatars**:
   ```bash
   cd /home/taylor/projects/LifeOS/lifeos-frontend
   node scripts/download-avatars.js
   ```

3. **Verify Downloads**:
   ```bash
   ls -la public/assets/avatar/stage-*/
   ```

4. **Update Avatar Evolution Data**:
   The sprite paths in `/src/data/avatarEvolution.js` are already configured to use:
   - `stage-1/south.png` through `stage-40/south.png`

5. **Test in App**:
   - Avatars will automatically load in `AvatarRenderer` component
   - Evolution stages will display pixel art instead of placeholders

## Animation Support (Future)

Each character can have animations added:

```javascript
// Available animation templates:
- breathing-idle (8 frames)
- walking (8 frames)
- running (6 frames)
- jumping
- fireball / power-up effects
```

To add animations after base characters are complete:
```javascript
mcp__pixellab__animate_character({
  character_id: "c19a9f31-c7e0-481e-a9a5-04234e0f160f",
  template_animation_id: "walking-8-frames",
  action_description: "walking confidently"
})
```

## File Structure

```
public/assets/avatar/
├── stage-1/
│   ├── south.png
│   ├── west.png
│   ├── east.png
│   └── north.png
├── stage-2/
│   └── ...
└── stage-40/
    └── ...
```

## Integration with Existing System

The avatar system will seamlessly integrate with:
- ✅ **Avatar Evolution** (`/src/data/avatarEvolution.js`) - 40 stages mapped
- ✅ **Avatar Renderer** (`/src/components/avatar/AvatarRenderer.jsx`) - Loads sprites by level
- ✅ **Avatar Customization** (`/src/components/avatar/AvatarCustomization.jsx`) - Equipment overlays
- ✅ **User Profiles** - Database stores `avatar_stage` and `avatar_url`

## Database Schema

Avatar data stored in `user_profiles`:
```sql
- avatar_stage TEXT DEFAULT 'ordinary_human'
- avatar_url TEXT -- URL to PixelLab hosted image (optional)
- avatar_animations JSONB -- Animation URLs/data
```

## Cost & Credits

- **Base Character**: ~100-150 credits per 4-direction character
- **Animation**: ~50-100 credits per animation per character
- **Total Queued**: 40 characters × ~125 credits = ~5,000 credits
- **Status**: Hit daily limit, waiting for refresh

## Testing

Once avatars are downloaded, test with:

```bash
# Start dev server
npm run dev

# Navigate to avatar customization or any page showing avatar
# Avatar will display PixelLab generated pixel art
```

---

**Last Updated**: 2025-11-21
**PixelLab Status**: Pending generation (daily limit reached)
**Next Action**: Wait for credit refresh, then run download script
