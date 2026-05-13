import React from 'react'
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material'
import { Settings } from '@mui/icons-material'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface Props { title?: string }

export function TopBar({ title = 'LaFanny' }: Props) {
  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', backdropFilter: 'blur(8px)' }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="span"
          sx={{ flexGrow: 1, fontFamily: 'Oswald, sans-serif', fontWeight: 700, letterSpacing: '0.1em', color: 'primary.main' }}
        >
          {title}
        </Typography>
        <IconButton component={Link as React.ElementType} to="/parametres" aria-label="Paramètres" color="inherit">
          <Settings />
        </IconButton>
        <ThemeToggle />
      </Toolbar>
    </AppBar>
  )
}
