# DeepTutor upstream pin

- Repository: <https://github.com/HKUDS/DeepTutor>
- Release tag: `v1.7.1`
- Commit: `f7aed0744c36c5afef16a4261c31ebee1208cac2`
- License: Apache-2.0; keep `LICENSE` and `THIRD_PARTY_NOTICES.md` intact.
- Before the CoastalTutor integration patches, local source was compared file-by-file with the upstream tag: all 4,471 files matched after normalizing CRLF/LF line endings. The imported Python package directory had been capitalized as `DeepTutor`; it is now named `deeptutor` to match upstream imports and Linux container paths.
- CoastalTutor patches in this checkout: host SSO ticket exchange and login/register lockout in `deeptutor/api/routers/auth.py`; stable host identity provisioning in `deeptutor/multi_user/identity.py`; source-tagged, report-only Guardian synchronization in `deeptutor/multi_user/guardians.py`; and local image build wiring in `compose.yaml`. These files now intentionally differ from upstream and should be rebased against a future reviewed release, not overwritten.
- `compose.yaml` builds a local integration image from this pinned source. `docker-compose.ghcr.yml` retains the official image pinned to `1.7.1` for unmodified upstream runs. Do not use the GHCR image for CoastalTutor SSO because it does not contain the integration patches.
- `data/`, environment files, and generated runtime state are not part of this source checkout. Configure them separately and back them up outside Git.
- This is a source tree inside the CoastalTutor repository, not a nested Git checkout or submodule. Keep this file as the upstream version record when changing the vendored source.

The official tag resolves to the commit above. The local import did not include `.git` metadata, so the file comparison against a fresh upstream tag is the provenance check for this snapshot.
