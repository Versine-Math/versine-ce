"""The Time Trial clock: how it adapts to each result, and where it is kept.

The numbers are pinned exactly. A second server that calibrated clocks a
little differently would quietly make the same level harder or easier for
a student depending on which edition they use (play/clock/asymmetric-adaptation).
"""
from __future__ import annotations

from .context import a_skill, group, progress, submit
from .harness import equal, test


def trial(student, *, duration, passed, time_left=None, target=10, level=0):
    skill, slugs = a_skill(student)
    return submit(student, skill, slugs, level, duration=duration, passed=passed,
                  target=target, timeLeft=time_left)


@test("running out of time loosens the clock by 15%")
def _():
    reply = trial(group().add_student(), duration=200, passed=False, time_left=0)
    equal(reply["clockWas"], 200, "clockWas")
    equal(reply["clockNext"], 230, "clock after running out of time")


@test("finishing with more than 20% of the clock to spare tightens it by 10%")
def _():
    equal(trial(group().add_student(), duration=200, passed=True, time_left=60)["clockNext"],
          180, "clock after finishing with 30% spare")


@test("finishing with 20% or less to spare leaves the clock alone")
def _():
    equal(trial(group().add_student(), duration=200, passed=True, time_left=40)["clockNext"],
          200, "clock after finishing with exactly 20% spare")


@test("the clock is rounded to a multiple of 5 seconds")
def _():
    # 207s * 1.15 = 238.05s, which shows as 240.
    equal(trial(group().add_student(), duration=207, passed=False, time_left=0)["clockNext"],
          240, "clock after loosening 207s")


# requiem: play/clock/trial-two-to-ten-minutes
@test("the clock never goes under two minutes, and says when it is there")
def _():
    # Tightening 120s would take it to 108, whatever the number of problems.
    reply = trial(group().add_student(), duration=120, passed=True, time_left=80, target=2)
    equal(reply["clockNext"], 120, "clock tightened at the floor")
    equal(reply["clockAtFloor"], True, "clockAtFloor at the floor")
    equal(trial(group().add_student(), duration=200, passed=False, time_left=0)["clockAtFloor"],
          False, "clockAtFloor well above the floor")


# requiem: play/clock/trial-two-to-ten-minutes
@test("the clock never goes over ten minutes")
def _():
    # Loosening 600s would take it to 690, whatever the number of problems.
    equal(trial(group().add_student(), duration=600, passed=False, time_left=0, target=12)["clockNext"],
          600, "clock loosened at the ceiling")


@test("each student's clock is kept per level, with its problem count and the trials behind it")
def _():
    student = group().add_student()
    skill, _ = a_skill(student)
    trial(student, duration=200, passed=False, time_left=0, target=4)
    equal(progress(student)["clocks"], {f"{skill}:0": {"duration": 230, "target": 4, "runs": 1}},
          "clocks after one trial")
    trial(student, duration=230, passed=True, time_left=100, target=4)
    equal(progress(student)["clocks"][f"{skill}:0"], {"duration": 205, "target": 4, "runs": 2},
          "clock after a second trial")


@test("practice and untimed runs leave the clock untouched")
def _():
    student = group().add_student()
    skill, slugs = a_skill(student)
    practice = submit(student, skill, slugs, 0, mode="practice", duration=100, passed=True)
    equal((practice["clockWas"], practice["clockNext"], practice["clockAtFloor"]),
          (100, None, False), "clock fields after a practice run")
    untimed = submit(student, skill, slugs, 0, duration=0, passed=True)
    equal((untimed["clockWas"], untimed["clockNext"], untimed["clockAtFloor"]),
          (None, None, False), "clock fields after an untimed trial")
    equal(progress(student)["clocks"], {}, "clocks")
