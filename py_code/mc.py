import numpy as np


class Mc:
    # """   3
    # """   2
    # """ 5 1 6
    # """   4
    # """
    # """ sides numbering
    # """1  2  3
    # """2
    # """3
    # """ row and column numering
    def __init__(self):
        self.sides = np.full((6, 3, 3), 0)
        for i in range(1, 7):
            self.sides[i - 1] = np.full((3, 3), i)

    def tilt(self, side, time=1):
        # clockwise
        if time == 2:
            self.tilt(side, 1)
            self.tilt(side, 1)
        elif time == 3:
            self.tilt(side, 1)
            self.tilt(side, 1)
            self.tilt(side, 1)

        else:
            if side == 'left':
                temp = self.sides[0, :, 0].copy()
                self.sides[0, :, 0] = self.sides[3, :, 0]
                self.sides[3, :, 0] = self.sides[2, :, 0]
                self.sides[2, :, 0] = self.sides[1, :, 0]
                self.sides[1, :, 0] = temp
                self.sides[4, ...].transpose()
            elif side == 'right':
                temp = self.sides[0, :, 2].copy()
                self.sides[0, :, 2] = self.sides[3, :, 2]
                self.sides[3, :, 2] = self.sides[2, :, 2]
                self.sides[2, :, 2] = self.sides[1, :, 2]
                self.sides[1, :, 2] = temp
                self.sides[5, ...].transpose()
            elif side == 'middle':
                for i in range(3):
                    self.tilt('right', 1)
                    self.tilt('left', 1)
            else:
                pass


mc = Mc()
print(mc.sides)
mc.tilt('right', 1)
mc.tilt('left', 2)
mc.tilt('middle', 3)

# print(mc.sides)
# mc.tilt('right', 1)
# print(mc.sides)
# mc.tilt('right', 3)
# mc.tilt('right', 3)
print(mc.sides)
