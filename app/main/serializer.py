
class Serializer:
    def __init__(self):
        self.zero = "+~!~~!~*@$&!^"
        self.one = "@@~!~#(*&"
        self.two = "#=~@!~*@$&!^"
        self.three = "*~!@~$~%!~*@$&!^"
        self.four = "&~!~]~!~*@$&!^"
        self.five = "~!~$~!~^*@$&!^"
        self.six = "~!~(~{!~#%#(*&"
        self.seven = "~@!@~!~!~#*@$&!^"
        self.eight = "~!~*&~!~#$$#$$"
        self.nine = "~$!$~@#~!~#$$$!$"
        self.a = "~!#%£$@#$%^&*(%&~~!#%£$@#$%^&*(%&~"
        self.b = "!#%£$@#$%^&*(%&~~!#%£$@#$%^&*(%&~~"
        self.c = "#%£$@#$%^&*(%&~~!#%£$@#$%^&*(%&~~!"
        self.d = "#$%^&*(%&~~!#%£$@#$%^&*(%&~~!#%£$@"
        self.e = "$%^&*(%&~~!#%£$@#$%^&*(%&~~!#%£$@#"
        self.f = "%^&*(%&~~!#%£$@#$%^&*(%&~~!#%£$@#$"
        self.g = "^&*(%&~~!#%£$@#$%^&*(%&~~!#%£$@#$%"
        self.h = "&*(%&~~!#%£$@#$%^&*(%&~~!#%£$@#$%^"
        self.i = "*(%&~~!#%£$@#$%^&*(%&~~!#%£$@#$%^&"
        self.j = "(%&~~!#%£$@#$%^&*(%&~~!#%£$@#$%^&*"
        self.k = "%&~~!#%£$@#$%^&*(%&~~!#%£$@#$%^&*("
        self.l = "_+~!#%£$@#$%^&*(%&~~!#%£$@#$%^&*()"
        self.m = "+~!#%£$@#$%^&*(%&~~!#%£$@#$%^&*()_"
        self.n = "+_)(*&^%$##%£$@!~+_)(*&^%$##%£$@!~"
        self.o = "_)(*&^%$##%£$@!~+_)(*&^%$##%£$@!~+"
        self.p = ")(*&^%$##%£$@!~+_)(*&^%$##%£$@!~"
        self.q = "(*&^%$##%£$@!~+_)(*&^%$##%£$@!~+_)"
        self.r = "*&^%$##%£$@!~+_)(*&^%$##%£$@!~+_)("
        self.s = "&^%$##%£$@!~+_)(*&^%$##%£$@!~+_)(*"
        self.t = "^%$##%£$@!~+_)(*&^%$##%£$@!~+_)(*&"
        self.u = "%$##%£$@!~+_)(*&^%$##%£$@!~+_)(*&^"
        self.v = "$##%£$@!~+_)(*&^%$##%£$@!~+_)(*&^%"
        self.w = "##%£$@!~+_)(*&^%$##%£$@!~+_)(*&^%$"
        self.x = "#%£$@!~+_)(*&^%$##%£$@!~+_)(*&^%$#"
        self.y = "!~+_)(*&^%$##%£$@!~+_)(*&^%$##%£$@"
        self.z = "~+_)(*&^%$##%£$@!~+_)(*&^%$##%£$@!"
        self.A = "~!#%£$@#$%^&*(%&~.~!#%£$@#$%^&*(%&~"
        self.B = "!#%£$@#$%^&*(%&~~.!#%£$@#$%^&*(%&~~"
        self.C = "#%£$@#$%^&*(%&~~.!#%£$@#$%^&*(%&~~!"
        self.D = "#$%^&*(%&~~!#%£$@.#$%^&*(%&~~!#%£$@"
        self.E = "$%^&*(%&~~!#%£$@#.$%^&*(%&~~!#%£$@#"
        self.F = "%^&*(%&~~!#%£$@#.$%^&*(%&~~!#%£$@#$"
        self.G = "^&*(%&~~!#%£$@#$.%^&*(%&~~!#%£$@#$%"
        self.H = "&*(%&~~!#%£$@#$%^.&*(%&~~!#%£$@#$%^"
        self.I = "*(%&~~!#%£$@#$%^&.*(%&~~!#%£$@#$%^&"
        self.J = "(%&~~!#%£$@#$%^&.*(%&~~!#%£$@#$%^&*"
        self.K = "%&~~!#%£$@#$%^&*(.%&~~!#%£$@#$%^&*("
        self.L = "_+~!#%£$@#$%^&*()._+~!#%£$@#$%^&*()"
        self.M = "+~!#%£$@#$%^&*()_.+~!#%£$@#$%^&*()_"
        self.N = "+_)(*&^%$##%£$@!.~+_)(*&^%$##%£$@!~"
        self.O = "_)(*&^%$##%£$@!~.+_)(*&^%$##%£$@!~+"
        self.P = ")(*&^%$##%£$@!~+._)(*&^%$##%£$@!~_"
        self.Q = "(*&^%$##%£$@!~+_).(*&^%$##%£$@!~+_)"
        self.R = "*&^%$##%£$@!~+_)(.*&^%$##%£$@!~+_)("
        self.S = "&^%$##%£$@!~+_)(.*&^%$##%£$@!~+_)(*"
        self.T = "^%$##%£$@!~+_)(*.&^%$##%£$@!~+_)(*&"
        self.U = "%$##%£$@!~+_)(*&^.%$##%£$@!~+_)(*&^"
        self.V = "$##%£$@!~+_)(*&^%.$##%£$@!~+_)(*&^%"
        self.W = "##%£$@!~+_)(*&^%$.##%£$@!~+_)(*&^%$"
        self.X = "#%£$@!~+_)(*&^%$#.#%£$@!~+_)(*&^%$#"
        self.Y = "!~+_)(*&^%$##%£$@.!~+_)(*&^%$##%£$@"
        self.Z = "~+_)(*&^%$##%£$@!.~+_)(*&^%$##%£$@!"
        self.sep = "|"
        self.exclamation = "[]{}:;?<>,"
        self.asterix = "]{}:;?<>,["
        self.pound = "{}:;?<>,[]"
        self.dols = "}:;?<>,[]{"
        self.percentage = ":;?<>,[]{}"
        self.ampersand = ";?<>,[]{}:"
        self.singleQuote = "?<>,[]{}:;"
        self.backtick = "??<>{}[]:;,"
        self.leftParenthesis = "<>,[]{}:;?"
        self.rightParenthesis = ">,[]{}:;?<"
        self.doubleQuote = ",[]{}:;?<>"
        self.plus = "?>,[]{}:;<"
        self.comma = "?<,[]{}:;>"
        self.hyphen = "?[],{}:;<>"
        self.dot = "?[,{}:;<>]"
        self.forSlash = "?{[;<,>:]}"
        self.backSlash = "?,:<>[]{};"
        self.colon = "<{[;,:]}?>"
        self.semicolon = "<{[:?;]}>,"
        self.lessThan = ">[;,?{}:]<"
        self.greaterThan = ">[;},{?:]<"
        self.equality = ":<[]{}>;,?"
        self.questionMark = ">,}]?[{<"
        self.at = ",>?{[}]<;:"
        self.leftBrace = ":{}[,]<>?;"
        self.rightBrace = "},[;:}{<>?"
        self.caret = "}?,;<:}]["
        self.underscore = "},:]{?>[<"
        self.leftBracket = ";,>{<}[]?:"
        self.rightBracket = ";]{:}[,<?>"
        self.tilde = "[?{;:}]<>,"
        self.space = "[,<:>}{/]"
        self.pipe = "{;:<,?>[]}"
        self.euro = "~?^*@!*!#&"

    def charConverter(self, raw):
    
        converted = self.sep
        if raw == ("0"):
            converted = self.zero
        elif  raw == ("1"):
            converted = self.one
        elif  raw == ("2"):
            converted = self.two
        elif  raw == ("3"):
            converted = self.three
        elif  raw == ("4"):
            converted = self.four
        elif  raw == ("5"):
            converted = self.five
        elif  raw == ("6"):
            converted = self.six
        elif  raw == ("7"):
            converted = self.seven
        elif  raw == ("8"):
            converted = self.eight
        elif  raw == ("9"):
            converted = self.nine
        elif  raw == ("a"):
            converted = self.a
        elif  raw == ("b"):
            converted = self.b
        elif  raw == ("c"):
            converted = self.c
        elif  raw == ("d"):
            converted = self.d
        elif  raw == ("e"):
            converted = self.e
        elif  raw == ("f"):
            converted = self.f
        elif  raw == ("g"):
            converted = self.g
        elif  raw == ("h"):
            converted = self.h
        elif  raw == ("i"):
            converted = self.i
        elif  raw == ("j"):
            converted = self.j
        elif  raw == ("k"):
            converted = self.k
        elif  raw == ("l"):
            converted = self.l
        elif  raw == ("m"):
            converted = self.m
        elif  raw == ("n"):
            converted = self.n
        elif  raw == ("o"):
            converted = self.o
        elif  raw == ("p"):
            converted = self.p
        elif  raw == ("q"):
            converted = self.q
        elif  raw == ("r"):
            converted = self.r
        elif  raw == ("s"):
            converted = self.s
        elif  raw == ("t"):
            converted = self.t
        elif  raw == ("u"):
            converted = self.u
        elif  raw == ("v"):
            converted = self.v
        elif  raw == ("w"):
            converted = self.w
        elif  raw == ("x"):
            converted = self.x
        elif  raw == ("y"):
            converted = self.y
        elif  raw == ("z"):
            converted = self.z
        elif  raw == ("A"):
            converted = self.A
        elif  raw == ("B"):
            converted = self.B
        elif  raw == ("C"):
            converted = self.C
        elif  raw == ("D"):
            converted = self.D
        elif  raw == ("E"):
            converted = self.E
        elif  raw == ("F"):
            converted = self.F
        elif  raw == ("G"):
            converted = self.G
        elif  raw == ("H"):
            converted = self.H
        elif  raw == ("I"):
            converted = self.I
        elif  raw == ("J"):
            converted = self.J
        elif  raw == ("K"):
            converted = self.K
        elif  raw == ("L"):
            converted = self.L
        elif  raw == ("M"):
            converted = self.M
        elif  raw == ("N"):
            converted = self.N
        elif  raw == ("O"):
            converted = self.O
        elif  raw == ("P"):
            converted = self.P
        elif  raw == ("Q"):
            converted = self.Q
        elif  raw == ("R"):
            converted = self.R
        elif  raw == ("S"):
            converted = self.S
        elif  raw == ("T"):
            converted = self.T
        elif  raw == ("U"):
            converted = self.U
        elif  raw == ("V"):
            converted = self.V
        elif  raw == ("W"):
            converted = self.W
        elif  raw == ("X"):
            converted = self.X
        elif  raw == ("Y"):
            converted = self.Y
        elif  raw == ("Z"):
            converted = self.Z
        elif  raw == ("!"):
            converted = self.exclamation
        elif  raw == ("`"):
            converted = self.backtick
        elif  raw == ("*"):
            converted = self.asterix
        elif  raw == ("#"):
            converted = self.pound
        elif  raw == ("£"):
            converted = self.euro
        elif  raw == ("$"):
            converted = self.dols
        elif  raw == ("%"):
            converted = self.percentage
        elif  raw == ("&"):
            converted = self.ampersand
        elif  raw == ("\'"):
            converted = self.singleQuote
        elif  raw == ("("):
            converted = self.leftParenthesis
        elif  raw == (")"):
            converted = self.rightParenthesis
        elif  raw == ("\""):
            converted = self.doubleQuote
        elif  raw == ("+"):
            converted = self.plus
        elif  raw == (","):
            converted = self.comma
        elif  raw == ("-"):
            converted = self.hyphen
        elif  raw == ("."):
            converted = self.dot
        elif  raw == ("/"):
            converted = self.forSlash
        elif  raw == ("\\"):
            converted = self.backSlash
        elif  raw == (":"):
            converted = self.colon
        elif  raw == (";"):
            converted = self.semicolon
        elif  raw == ("<"):
            converted = self.lessThan
        elif  raw == (">"):
            converted = self.greaterThan
        elif  raw == ("="):
            converted = self.equality
        elif  raw == ("?"):
            converted = self.questionMark
        elif  raw == ("@"):
            converted = self.at
        elif  raw == ("["):
            converted = self.leftBrace
        elif  raw == ("]"):
            converted = self.rightBrace
        elif  raw == ("^"):
            converted = self.caret
        elif  raw == ("_"):
            converted = self.underscore
        elif  raw == ("{"):
            converted = self.leftBracket
        elif  raw == ("}"):
            converted = self.rightBracket
        elif  raw == ("~"):
            converted = self.tilde
        elif  raw == (" "):
            converted = self.space
        elif  raw == ("|"):
            converted = self.pipe
        return converted
        
    def retriever (self,coded) :
        converted = self.sep
        if self.zero == (coded):
            converted = "0"
        elif  self.one == (coded):
            converted = "1"
        elif  self.two == (coded):
            converted = "2"
        elif  self.three == (coded):
            converted = "3"
        elif  self.four == (coded):
            converted = "4"
        elif  self.five == (coded):
            converted = "5"
        elif  self.six == (coded):
            converted = "6"
        elif  self.seven == (coded):
            converted = "7"
        elif  self.eight == (coded):
            converted = "8"
        elif  self.nine == (coded):
            converted = "9"
        elif  self.a == (coded):
            converted = "a"
        elif  self.b == (coded):
            converted = "b"
        elif  self.c == (coded):
            converted = "c"
        elif  self.d == (coded):
            converted = "d"
        elif  self.e == (coded):
            converted = "e"
        elif  self.f == (coded):
            converted = "f"
        elif  self.g == (coded):
            converted = "g"
        elif  self.h == (coded):
            converted = "h"
        elif  self.i == (coded):
            converted = "i"
        elif  self.j == (coded):
            converted = "j"
        elif  self.k == (coded):
            converted = "k"
        elif  self.l == (coded):
            converted = "l"
        elif  self.m == (coded):
            converted = "m"
        elif  self.n == (coded):
            converted = "n"
        elif  self.o == (coded):
            converted = "o"
        elif  self.p == (coded):
            converted = "p"
        elif  self.q == (coded):
            converted = "q"
        elif  self.r == (coded):
            converted = "r"
        elif  self.s == (coded):
            converted = "s"
        elif  self.t == (coded):
            converted = "t"
        elif  self.u == (coded):
            converted = "u"
        elif  self.v == (coded):
            converted = "v"
        elif  self.w == (coded):
            converted = "w";
        elif  self.x == (coded):
            converted = "x"
        elif  self.y == (coded):
            converted = "y"
        elif  self.z == (coded):
            converted = "z"
        elif  self.A == (coded):
            converted = "A"
        elif  self.B == (coded):
            converted = "B"
        elif  self.C == (coded):
            converted = "C"
        elif  self.D == (coded):
            converted = "D"
        elif  self.E == (coded):
            converted = "E"
        elif  self.F == (coded):
            converted = "F"
        elif  self.G == (coded):
            converted = "G"
        elif  self.H == (coded):
            converted = "H"
        elif  self.I == (coded):
            converted = "I"
        elif  self.J == (coded):
            converted = "J"
        elif  self.K == (coded):
            converted = "K"
        elif  self.L == (coded):
            converted = "L"
        elif  self.M == (coded):
            converted = "M"
        elif  self.N == (coded):
            converted = "N"
        elif  self.O == (coded):
            converted = "O"
        elif  self.P == (coded):
            converted = "P"
        elif  self.Q == (coded):
            converted = "Q"
        elif  self.R == (coded):
            converted = "R"
        elif  self.S == (coded):
            converted = "S"
        elif  self.T == (coded):
            converted = "T"
        elif  self.U == (coded):
            converted = "U"
        elif  self.V == (coded):
            converted = "V"
        elif  self.W == (coded):
            converted = "W"
        elif  self.X == (coded):
            converted = "X"
        elif  self.Y == (coded):
            converted = "Y"
        elif  self.Z == (coded):
            converted = "Z"
        elif  self.exclamation == (coded):
            converted = "!"
        elif  self.asterix == (coded):
            converted = "*"
        elif  self.backtick == (coded):
            converted = "`"
        elif  self.pound == (coded):
            converted = "#"
        elif  self.dols == (coded):
            converted = "$"
        elif  self.percentage == (coded):
            converted = "%"
        elif  self.ampersand == (coded):
            converted = "&"
        elif  self.singleQuote == (coded):
            converted = "'"
        elif  self.leftParenthesis == (coded):
            converted = "("
        elif  self.rightParenthesis == (coded):
            converted = ")"
        elif  self.doubleQuote == (coded):
            converted = "\""
        elif  self.plus == (coded):
            converted = "+"
        elif  self.comma == (coded):
            converted = ",";
        elif  self.hyphen == (coded):
            converted = "-"
        elif  self.dot == (coded):
            converted = "."
        elif  self.forSlash == (coded):
            converted = "/"
        elif  self.backSlash == (coded):
            converted = "\\"
        elif  self.colon == (coded):
            converted = ":"
        elif  self.semicolon == (coded):
            converted = ";"
        elif  self.lessThan == (coded):
            converted = "<"
        elif  self.greaterThan == (coded):
            converted = ">"
        elif  self.equality == (coded):
            converted = "="
        elif  self.questionMark == (coded):
            converted = "?"
        elif  self.at == (coded):
            converted = "@"
        elif  self.leftBrace == (coded):
            converted = "["
        elif  self.rightBrace == (coded):
            converted = "]"
        elif  self.caret == (coded):
            converted = "^"
        elif  self.underscore == (coded):
            converted = "_"
        elif  self.leftBracket == (coded):
            converted = "{"
        elif  self.rightBracket == (coded):
            converted = "}"
        elif  self.tilde == (coded):
            converted = "~"
        elif  self.space == (coded):
            converted = " "
        elif self.pipe == (coded):
            converted = "|"
        elif self.euro == (coded):
            converted = "£"
        return converted

    def scramble (self,plain):
        coded = ""
        try:
            span = len(plain);
            for cursor in range(0, span):
                temp =  plain[cursor]
                coded += self.charConverter(temp)
                coded += self.sep
        except Exception as e:
            print("Exception: {e}".format(e=e))
            #traceback.print_exec()
        return coded
       
    def decipher (self, coded):
        plain= "";
        span = len(coded);
        buf = "";
        for cursor in range(0, span):
            temp = coded[cursor];
            if temp != (self.sep):
                buf += coded[cursor]
            else:
                plain += self.retriever(buf)
                buf = ""
        return plain
        
    def multiCrypt(self,raw,times):
        coded  = raw		
        for i in range(0,times ):
            coded = self.scramble(coded)
        return coded	

    def multiDemystify(self,coded,times):
        raw =coded
        for i in range(0,times):
            raw = self.decipher(raw)
        return raw
    