# From Instrument-Mounted Demonstrations to In-Vivo Execution: Learning Bimanual Laparoscopic Appendectomy Without Robot-Collected Demonstrations

**Project page:** https://rosota-research.github.io/instrument-mounted-demonstrations-in-vivo/
**Paper:** https://arxiv.org/abs/2609.25625 (arXiv:2609.25625, cs.RO, submitted to IEEE ICRA 2027)
**Data:** https://github.com/Rosota-Research/ICRA2027-Invivo-main
**Group:** https://www.rosota.ai

Dongho Yee, Juahn Oh, Jinseok Lee, Jiyul Lee, Yechan Seo, Seong Jeong, Minsung Kim, Seonho Shim, Younghoon Noh, Hyuk Choi, Youngbin Kong, Kyu Eun Lee, Hyoun-Joong Kong.
Seoul National University Hospital, Rosota Inc., Seoul National University, Eulji University, Chungang University.

A shaft-mounted instrument-state logger records a surgeon's own hand-held laparoscopic instruments in the operating room. Every sensor channel is latency-matched against a robot ground truth, a diffusion policy with a fine-tuned DINOv3 backbone is selected by closed-loop rollouts in a simulator reconstructed from the ex-vivo scene, and the policy retrained on 849 in-vivo demonstrations completed the appendectomy in three of four live rabbits with electrosurgery armed. The robot collected no demonstrations.

## This repository

The static project page served by GitHub Pages. No build step; `index.html`, `assets/css`, `assets/js` and the media under `assets/` are the whole site.

- `tools/build_images.py` regenerates the figures and the social-preview card from the paper workspace.
- `tools/encode_videos.sh` re-encodes the clips with ffmpeg.
- `tools/manifest.json` lists the generated image sizes.

## Citation

```bibtex
@article{yee2026instrument,
  title   = {From Instrument-Mounted Demonstrations to In-Vivo Execution: Learning Bimanual
             Laparoscopic Appendectomy Without Robot-Collected Demonstrations},
  author  = {Yee, Dongho and Oh, Juahn and Lee, Jinseok and Lee, Jiyul and Seo, Yechan and
             Jeong, Seong and Kim, Minsung and Shim, Seonho and Noh, Younghoon and Choi, Hyuk and
             Kong, Youngbin and Lee, Kyu Eun and Kong, Hyoun-Joong},
  journal = {arXiv preprint arXiv:2609.25625},
  year    = {2026},
  url     = {https://arxiv.org/abs/2609.25625}
}
```
