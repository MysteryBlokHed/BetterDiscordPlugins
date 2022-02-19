# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changelogs are different for each plugin.

## 0.5.1

### Fixed

- Fixed rejected Promises stopping MsgHook from working entirely

## 0.5.0

### Added

- Ability to set RegEx validation for messages before calling hooks

## 0.4.1

### Changed

- Updated TypeScript-related docs

## 0.4.0

### Added

- Added support for async hooks
- Added unique ID for hooks
- Added function to remove hooks
- Added request URL property (`url`) to MsgHookEvent

## 0.3.0

### Added

- Added a way to get the request headers from a hook

## 0.2.0

### Added

- Added a method to get message ID for new and edited messages as well as docs in the README

### Fixed

- Made hooks only run when the plugin is enabled

## 0.1.0

### Added

- System to montior for sent and edited messages
