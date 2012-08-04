
TESTS = $(wildcard test/test.*.js)

bm:
	node benchmark/pub &
	node benchmark/sub

test:
	@./test/run $(TESTS)
	
.PHONY: test bm